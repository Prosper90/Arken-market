/**
 * Arken Solana Service
 * Handles on-chain bet placement and market management on the Solana Anchor program.
 *
 * Fee structure (2% total, 4-way split — matches EVM):
 *   REFERRAL  = 60 bps → treasury_fee_pool (backend distributes off-chain via event logs)
 *   CREATOR   = 40 bps → creator_fee_pool
 *   LP        = 20 bps → lp_fee_pool
 *   TREASURY  = 80 bps → treasury_fee_pool
 *
 * Env vars required after anchor deploy:
 *   ARKEN_PROGRAM_ID    — deployed program ID
 *   SOLANA_RPC_URL      — Solana RPC endpoint
 *   SOLANA_USDC_MINT    — USDC mint address
 *   SOLANA_TREASURY     — Treasury wallet pubkey (for fee routing)
 */

const {
  Connection, PublicKey, Keypair, SystemProgram,
  SYSVAR_RENT_PUBKEY, Transaction, LAMPORTS_PER_SOL,
} = require("@solana/web3.js");
const { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } = require("@solana/spl-token");
const anchor = require("@coral-xyz/anchor");
const { BN } = anchor;

// ─── Inline IDL ──────────────────────────────────────────────────────────────

const IDL = {
  version: "0.1.0",
  name: "arken_markets",
  instructions: [
    {
      name: "createMarket",
      accounts: [
        { name: "authority",     isMut: true,  isSigner: true  },
        { name: "market",        isMut: true,  isSigner: false },
        { name: "vault",         isMut: true,  isSigner: false },
        { name: "usdcMint",      isMut: false, isSigner: false },
        { name: "tokenProgram",  isMut: false, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false },
        { name: "rent",          isMut: false, isSigner: false },
      ],
      args: [{ name: "params", type: { defined: "CreateMarketParams" } }],
    },
    {
      name: "addLiquidity",
      accounts: [
        { name: "user",            isMut: true,  isSigner: true  },
        { name: "market",          isMut: true,  isSigner: false },
        { name: "lpPosition",      isMut: true,  isSigner: false },
        { name: "vault",           isMut: true,  isSigner: false },
        { name: "userUsdcAccount", isMut: true,  isSigner: false },
        { name: "usdcMint",        isMut: false, isSigner: false },
        { name: "tokenProgram",    isMut: false, isSigner: false },
        { name: "systemProgram",   isMut: false, isSigner: false },
      ],
      args: [{ name: "params", type: { defined: "AddLiquidityParams" } }],
    },
    {
      name: "placeBet",
      accounts: [
        { name: "user",            isMut: true,  isSigner: true  },
        { name: "market",          isMut: true,  isSigner: false },
        { name: "position",        isMut: true,  isSigner: false },
        { name: "vault",           isMut: true,  isSigner: false },
        { name: "userUsdcAccount", isMut: true,  isSigner: false },
        { name: "usdcMint",        isMut: false, isSigner: false },
        { name: "tokenProgram",    isMut: false, isSigner: false },
        { name: "systemProgram",   isMut: false, isSigner: false },
      ],
      args: [{ name: "params", type: { defined: "PlaceBetParams" } }],
    },
    {
      name: "sellOption",
      accounts: [
        { name: "user",            isMut: true,  isSigner: true  },
        { name: "market",          isMut: true,  isSigner: false },
        { name: "position",        isMut: true,  isSigner: false },
        { name: "vault",           isMut: true,  isSigner: false },
        { name: "userUsdcAccount", isMut: true,  isSigner: false },
        { name: "usdcMint",        isMut: false, isSigner: false },
        { name: "tokenProgram",    isMut: false, isSigner: false },
        { name: "systemProgram",   isMut: false, isSigner: false },
      ],
      args: [{ name: "params", type: { defined: "SellOptionParams" } }],
    },
    {
      name: "closeMarket",
      accounts: [
        { name: "authority", isMut: true,  isSigner: true  },
        { name: "market",    isMut: true,  isSigner: false },
      ],
      args: [],
    },
    {
      name: "resolveMarket",
      accounts: [
        { name: "authority", isMut: true,  isSigner: true  },
        { name: "market",    isMut: true,  isSigner: false },
      ],
      args: [{ name: "winningOption", type: "u8" }],
    },
    {
      name: "claimWinnings",
      accounts: [
        { name: "user",            isMut: true,  isSigner: true  },
        { name: "market",          isMut: false, isSigner: false },
        { name: "position",        isMut: true,  isSigner: false },
        { name: "vault",           isMut: true,  isSigner: false },
        { name: "userUsdcAccount", isMut: true,  isSigner: false },
        { name: "usdcMint",        isMut: false, isSigner: false },
        { name: "tokenProgram",    isMut: false, isSigner: false },
        { name: "systemProgram",   isMut: false, isSigner: false },
      ],
      args: [],
    },
    {
      name: "claimLpPosition",
      accounts: [
        { name: "user",            isMut: true,  isSigner: true  },
        { name: "market",          isMut: false, isSigner: false },
        { name: "lpPosition",      isMut: true,  isSigner: false },
        { name: "vault",           isMut: true,  isSigner: false },
        { name: "userUsdcAccount", isMut: true,  isSigner: false },
        { name: "usdcMint",        isMut: false, isSigner: false },
        { name: "tokenProgram",    isMut: false, isSigner: false },
        { name: "systemProgram",   isMut: false, isSigner: false },
      ],
      args: [{ name: "params", type: { defined: "ClaimLpPositionParams" } }],
    },
    {
      name: "claimCreatorFees",
      accounts: [
        { name: "creator",            isMut: true,  isSigner: true  },
        { name: "market",             isMut: true,  isSigner: false },
        { name: "vault",              isMut: true,  isSigner: false },
        { name: "creatorUsdcAccount", isMut: true,  isSigner: false },
        { name: "usdcMint",           isMut: false, isSigner: false },
        { name: "tokenProgram",       isMut: false, isSigner: false },
        { name: "systemProgram",      isMut: false, isSigner: false },
      ],
      args: [],
    },
    {
      name: "claimTreasuryFees",
      accounts: [
        { name: "caller",                isMut: true,  isSigner: true  },
        { name: "market",                isMut: true,  isSigner: false },
        { name: "vault",                 isMut: true,  isSigner: false },
        { name: "treasuryUsdcAccount",   isMut: true,  isSigner: false },
        { name: "usdcMint",              isMut: false, isSigner: false },
        { name: "tokenProgram",          isMut: false, isSigner: false },
        { name: "systemProgram",         isMut: false, isSigner: false },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: "Market",
      type: {
        kind: "struct",
        fields: [
          { name: "authority",              type: "publicKey" },
          { name: "treasury",               type: "publicKey" },
          { name: "creator",                type: "publicKey" },
          { name: "marketId",               type: { array: ["u8", 32] } },
          { name: "pools",                  type: { array: ["u64", 10] } },
          { name: "lpPoolSeeds",            type: { array: ["u64", 10] } },
          { name: "outcomeShares",          type: { array: ["u64", 10] } },
          { name: "outcomeCount",           type: "u8"  },
          { name: "creatorFeePool",         type: "u64" },
          { name: "lpFeePool",              type: "u64" },
          { name: "treasuryFeePool",        type: "u64" },
          { name: "totalLpShares",          type: "u64" },
          { name: "endTime",                type: "i64" },
          { name: "status",                 type: "u8"  },
          { name: "winningOption",          type: "u8"  },
          { name: "resolvedTotalPool",      type: "u64" },
          { name: "resolvedWinningSupply",  type: "u64" },
          { name: "resolvedLpWinningSeeds", type: "u64" },
          { name: "bump",                   type: "u8"  },
          { name: "vaultBump",              type: "u8"  },
        ],
      },
    },
    {
      name: "Position",
      type: {
        kind: "struct",
        fields: [
          { name: "user",    type: "publicKey" },
          { name: "market",  type: "publicKey" },
          { name: "option",  type: "u8"   },
          { name: "shares",  type: "u64"  },
          { name: "claimed", type: "bool" },
          { name: "bump",    type: "u8"   },
        ],
      },
    },
    {
      name: "LpPosition",
      type: {
        kind: "struct",
        fields: [
          { name: "user",     type: "publicKey" },
          { name: "market",   type: "publicKey" },
          { name: "lpShares", type: "u64"  },
          { name: "claimed",  type: "bool" },
          { name: "bump",     type: "u8"   },
        ],
      },
    },
  ],
  types: [
    {
      name: "CreateMarketParams",
      type: {
        kind: "struct",
        fields: [
          { name: "marketId",     type: { array: ["u8", 32] } },
          { name: "endTime",      type: "i64" },
          { name: "outcomeCount", type: "u8"  },
          { name: "treasury",     type: "publicKey" },
          { name: "creator",      type: "publicKey" },
        ],
      },
    },
    {
      name: "PlaceBetParams",
      type: {
        kind: "struct",
        fields: [
          { name: "marketId", type: { array: ["u8", 32] } },
          { name: "option",   type: "u8"  },
          { name: "amount",   type: "u64" },
          { name: "referrer", type: "publicKey" },
        ],
      },
    },
    {
      name: "AddLiquidityParams",
      type: {
        kind: "struct",
        fields: [
          { name: "marketId", type: { array: ["u8", 32] } },
          { name: "amount",   type: "u64" },
        ],
      },
    },
    {
      name: "SellOptionParams",
      type: {
        kind: "struct",
        fields: [
          { name: "marketId",       type: { array: ["u8", 32] } },
          { name: "sellPercentage", type: "u8" },
          { name: "referrer",       type: "publicKey" },
        ],
      },
    },
    {
      name: "ClaimLpPositionParams",
      type: {
        kind: "struct",
        fields: [
          { name: "marketId", type: { array: ["u8", 32] } },
        ],
      },
    },
  ],
  errors: [
    { code: 6000, name: "MarketNotOpen",         msg: "Market is not open for betting" },
    { code: 6001, name: "MarketAlreadyResolved",  msg: "Market has already been resolved" },
    { code: 6002, name: "MarketNotEnded",         msg: "Market has not been resolved yet" },
    { code: 6003, name: "InvalidOption",          msg: "Invalid option index" },
    { code: 6004, name: "BetTooLow",              msg: "Amount is too low" },
    { code: 6005, name: "NoWinnings",             msg: "No winnings or shares to claim" },
    { code: 6006, name: "AlreadyClaimed",         msg: "Already claimed" },
    { code: 6007, name: "Unauthorized",           msg: "Only the market authority can perform this action" },
    { code: 6008, name: "MarketExpired",          msg: "Market has expired" },
    { code: 6009, name: "InvalidOutcomeCount",    msg: "Outcome count must be between 2 and 10" },
    { code: 6010, name: "NoShares",               msg: "Position has no shares" },
    { code: 6011, name: "InvalidSellPercentage",  msg: "Sell percentage must be between 1 and 100" },
    { code: 6012, name: "NoFees",                 msg: "No fees to claim" },
    { code: 6013, name: "NotCreator",             msg: "Not the creator of this market" },
    { code: 6014, name: "NotTreasury",            msg: "Not the treasury of this market" },
  ],
};

// ─── Config ───────────────────────────────────────────────────────────────────

const PROGRAM_ID_STR = process.env.ARKEN_PROGRAM_ID  || "";
const RPC_URL        = process.env.SOLANA_RPC_URL    || "https://api.devnet.solana.com";
const USDC_MINT_STR  = process.env.SOLANA_USDC_MINT  || "";
const TREASURY_STR   = process.env.SOLANA_TREASURY   || "";
const USDC_DECIMALS  = 6;

function isDeployed() {
  return (
    PROGRAM_ID_STR &&
    PROGRAM_ID_STR !== "<your deployed program ID after anchor deploy>" &&
    USDC_MINT_STR
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getConnection() {
  return new Connection(RPC_URL, "confirmed");
}

function loadKeypair(privateKeyValue) {
  if (!privateKeyValue) throw new Error("No private key provided");
  try {
    const bytes = JSON.parse(privateKeyValue);
    return Keypair.fromSecretKey(Uint8Array.from(bytes));
  } catch {
    const bs58 = require("bs58");
    const decoded = bs58.default ? bs58.default.decode(privateKeyValue) : bs58.decode(privateKeyValue);
    return Keypair.fromSecretKey(decoded);
  }
}

function getProgram(keypair) {
  if (!isDeployed()) throw new Error("Solana program not yet deployed — set ARKEN_PROGRAM_ID");
  const connection = getConnection();
  const wallet = new anchor.Wallet(keypair);
  const provider = new anchor.AnchorProvider(connection, wallet, { commitment: "confirmed" });
  const programId = new PublicKey(PROGRAM_ID_STR);
  // Anchor 0.29 API: (IDL, programId, provider)
  return new anchor.Program(IDL, programId, provider);
}

function deriveMarketPDA(marketIdArray) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("market"), Buffer.from(marketIdArray)],
    new PublicKey(PROGRAM_ID_STR)
  );
}

function deriveVaultPDA(marketPda) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), marketPda.toBuffer()],
    new PublicKey(PROGRAM_ID_STR)
  );
}

function derivePositionPDA(marketPda, userPubkey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("position"), marketPda.toBuffer(), userPubkey.toBuffer()],
    new PublicKey(PROGRAM_ID_STR)
  );
}

function deriveLpPositionPDA(marketPda, userPubkey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("lp"), marketPda.toBuffer(), userPubkey.toBuffer()],
    new PublicKey(PROGRAM_ID_STR)
  );
}

function mongoIdToBytes32(mongodbId) {
  const bytes = Buffer.alloc(32, 0);
  const src = Buffer.from(mongodbId.slice(0, 32), "utf8");
  src.copy(bytes, 0, 0, Math.min(src.length, 32));
  return bytes;
}

const ZERO_PUBKEY = new PublicKey("11111111111111111111111111111111");

function getTreasury() {
  return TREASURY_STR ? new PublicKey(TREASURY_STR) : ZERO_PUBKEY;
}

// ─── Core: Place Bet ──────────────────────────────────────────────────────────

/**
 * @param {string} params.privateKey    - User's Solana private key
 * @param {string} params.mongodbId     - Market MongoDB _id
 * @param {number} params.optionIndex   - Outcome index (0=Yes, 1=No, ...)
 * @param {number} params.amountUsdc    - Human-readable USDC amount
 * @param {string} [params.referrer]    - Referrer Solana pubkey (base58), optional
 */
async function placeBet({ privateKey, mongodbId, optionIndex, amountUsdc, referrer }) {
  if (!isDeployed()) {
    console.warn("[ArkenSolana] Program not deployed — skipping on-chain bet");
    return null;
  }

  const keypair    = loadKeypair(privateKey);
  const program    = getProgram(keypair);
  const connection = getConnection();

  // Check user has enough SOL to cover gas — if not, surface a clear message
  const MIN_LAMPORTS = 10_000;
  const solBalance = await connection.getBalance(keypair.publicKey);
  if (solBalance < MIN_LAMPORTS) {
    throw new Error(`Insufficient SOL for gas fees. Your Solana wallet (${keypair.publicKey.toBase58()}) has ${solBalance / 1e9} SOL — please deposit at least 0.001 SOL to cover transaction fees.`);
  }

  const marketIdArray  = mongoIdToBytes32(mongodbId);
  const amountLamports = new BN(Math.round(amountUsdc * 10 ** USDC_DECIMALS));
  const referrerPubkey = referrer ? new PublicKey(referrer) : ZERO_PUBKEY;

  const [marketPda]   = deriveMarketPDA(marketIdArray);
  const [vaultPda]    = deriveVaultPDA(marketPda);
  const [positionPda] = derivePositionPDA(marketPda, keypair.publicKey);

  const usdcMint    = new PublicKey(USDC_MINT_STR);
  const userUsdcAta = await getAssociatedTokenAddress(usdcMint, keypair.publicKey);

  let txHash;
  try {
    txHash = await program.methods
      .placeBet({ marketId: marketIdArray, option: optionIndex, amount: amountLamports, referrer: referrerPubkey })
      .accounts({
        user: keypair.publicKey,
        market: marketPda,
        position: positionPda,
        vault: vaultPda,
        userUsdcAccount: userUsdcAta,
        usdcMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  } catch (err) {
    if (err.name === 'TransactionExpiredTimeoutError' || err.message?.includes('Transaction was not confirmed')) {
      const sig = err.signature || err.message?.match(/[1-9A-HJ-NP-Za-km-z]{87,88}/)?.[0];
      if (sig) {
        for (let attempt = 1; attempt <= 3; attempt++) {
          await new Promise(r => setTimeout(r, 8000));
          const statuses = await connection.getSignatureStatuses([sig]);
          const status = statuses?.value?.[0];
          if (status && !status.err) {
            console.log(`[ArkenSolana] Bet tx confirmed on attempt ${attempt}. TxHash:`, sig);
            return { txHash: sig, walletAddress: keypair.publicKey.toBase58() };
          }
          console.log(`[ArkenSolana] Bet tx not yet confirmed (attempt ${attempt}/3)`);
        }
      }
      throw new Error("Your bet transaction timed out on Solana testnet. The network may be congested — please try again in a moment.");
    }
    if (err.error?.errorCode?.code === 'InvalidOption') {
      throw new Error("This market does not support the selected outcome on-chain. It may have been created with only one outcome. Please contact support or try a different market.");
    }
    throw err;
  }

  console.log("[ArkenSolana] Bet placed. TxHash:", txHash);
  return { txHash, walletAddress: keypair.publicKey.toBase58() };
}

// ─── User: Sell Position ──────────────────────────────────────────────────────

/**
 * @param {string} params.privateKey       - User's Solana private key
 * @param {string} params.mongodbId        - Market MongoDB _id
 * @param {number} [params.sellPercentage] - 1-100, default 100 (full sell)
 * @param {string} [params.referrer]       - Referrer pubkey (base58)
 */
async function sellPosition({ privateKey, mongodbId, sellPercentage, referrer }) {
  if (!isDeployed()) {
    console.warn("[ArkenSolana] Program not deployed — skipping sell");
    return null;
  }

  const keypair    = loadKeypair(privateKey);
  const program    = getProgram(keypair);
  const connection = getConnection();

  // Check user has enough SOL to cover gas — if not, surface a clear message
  const MIN_LAMPORTS = 10_000;
  const solBalance = await connection.getBalance(keypair.publicKey);
  if (solBalance < MIN_LAMPORTS) {
    throw new Error(`Insufficient SOL for gas fees. Your Solana wallet (${keypair.publicKey.toBase58()}) has ${solBalance / 1e9} SOL — please deposit at least 0.001 SOL to cover transaction fees.`);
  }

  const marketIdArray  = mongoIdToBytes32(mongodbId);
  const pct = sellPercentage && Number(sellPercentage) > 0
    ? Math.min(100, Math.max(1, Math.round(Number(sellPercentage))))
    : 100;
  const referrerPubkey = referrer ? new PublicKey(referrer) : ZERO_PUBKEY;

  const [marketPda]   = deriveMarketPDA(marketIdArray);
  const [vaultPda]    = deriveVaultPDA(marketPda);
  const [positionPda] = derivePositionPDA(marketPda, keypair.publicKey);

  const usdcMint    = new PublicKey(USDC_MINT_STR);
  const userUsdcAta = await getAssociatedTokenAddress(usdcMint, keypair.publicKey);

  let txHash;
  try {
    txHash = await program.methods
      .sellOption({ marketId: marketIdArray, sellPercentage: pct, referrer: referrerPubkey })
      .accounts({
        user: keypair.publicKey,
        market: marketPda,
        position: positionPda,
        vault: vaultPda,
        userUsdcAccount: userUsdcAta,
        usdcMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  } catch (err) {
    if (err.name === 'TransactionExpiredTimeoutError' || err.message?.includes('Transaction was not confirmed')) {
      const sig = err.signature || err.message?.match(/[1-9A-HJ-NP-Za-km-z]{87,88}/)?.[0];
      if (sig) {
        for (let attempt = 1; attempt <= 3; attempt++) {
          await new Promise(r => setTimeout(r, 8000));
          const statuses = await connection.getSignatureStatuses([sig]);
          const status = statuses?.value?.[0];
          if (status && !status.err) {
            console.log(`[ArkenSolana] Sell tx confirmed on attempt ${attempt}. TxHash:`, sig);
            return { txHash: sig, walletAddress: keypair.publicKey.toBase58() };
          }
          console.log(`[ArkenSolana] Sell tx not yet confirmed (attempt ${attempt}/3)`);
        }
      }
      throw new Error("Your sell transaction timed out on Solana testnet. The network may be congested — please try again in a moment.");
    }
    throw err;
  }

  console.log(`[ArkenSolana] Position sold (${pct}%). TxHash:`, txHash);
  return { txHash, walletAddress: keypair.publicKey.toBase58() };
}

// ─── User: Add Liquidity ──────────────────────────────────────────────────────

/**
 * @param {string} params.privateKey   - LP's Solana private key
 * @param {string} params.mongodbId    - Market MongoDB _id
 * @param {number} params.amountUsdc   - Human-readable USDC amount
 */
async function addLiquidity({ privateKey, mongodbId, amountUsdc }) {
  if (!isDeployed()) {
    console.warn("[ArkenSolana] Program not deployed — skipping addLiquidity");
    return null;
  }

  const keypair = loadKeypair(privateKey);
  const program = getProgram(keypair);

  const marketIdArray  = mongoIdToBytes32(mongodbId);
  const amountLamports = new BN(Math.round(amountUsdc * 10 ** USDC_DECIMALS));

  const [marketPda]    = deriveMarketPDA(marketIdArray);
  const [vaultPda]     = deriveVaultPDA(marketPda);
  const [lpPositionPda] = deriveLpPositionPDA(marketPda, keypair.publicKey);

  const usdcMint    = new PublicKey(USDC_MINT_STR);
  const userUsdcAta = await getAssociatedTokenAddress(usdcMint, keypair.publicKey);

  const txHash = await program.methods
    .addLiquidity({ marketId: marketIdArray, amount: amountLamports })
    .accounts({
      user: keypair.publicKey,
      market: marketPda,
      lpPosition: lpPositionPda,
      vault: vaultPda,
      userUsdcAccount: userUsdcAta,
      usdcMint,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  console.log(`[ArkenSolana] Liquidity added. TxHash:`, txHash);
  return { txHash, walletAddress: keypair.publicKey.toBase58() };
}

// ─── Admin: Create Market ─────────────────────────────────────────────────────

/**
 * @param {string} params.adminPrivateKey   - Admin Solana keypair
 * @param {string} params.mongodbId         - MongoDB _id as PDA seed
 * @param {number} params.endTimestamp      - Unix timestamp (seconds)
 * @param {number} [params.outcomeCount]    - Default 2
 * @param {string} [params.creatorAddress]  - Creator Solana pubkey (base58)
 */
async function createMarket({ adminPrivateKey, mongodbId, endTimestamp, outcomeCount = 2, creatorAddress }) {
  if (!isDeployed()) {
    console.warn("[ArkenSolana] Program not deployed — skipping market creation");
    return null;
  }

  const keypair = loadKeypair(adminPrivateKey);
  const program = getProgram(keypair);

  const marketIdArray    = mongoIdToBytes32(mongodbId);
  const [marketPda]      = deriveMarketPDA(marketIdArray);
  const [vaultPda]       = deriveVaultPDA(marketPda);
  const usdcMint         = new PublicKey(USDC_MINT_STR);
  const safeOutcomeCount = Math.max(2, Math.min(10, outcomeCount));
  const treasury         = getTreasury();
  const creator          = creatorAddress ? new PublicKey(creatorAddress) : ZERO_PUBKEY;

  const txHash = await program.methods
    .createMarket({
      marketId: marketIdArray,
      endTime: new BN(endTimestamp.toString()),
      outcomeCount: safeOutcomeCount,
      treasury,
      creator,
    })
    .accounts({
      authority: keypair.publicKey,
      market: marketPda,
      vault: vaultPda,
      usdcMint,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    })
    .signers([keypair])
    .rpc();

  console.log("[ArkenSolana] Market created. PDA:", marketPda.toBase58(), "TxHash:", txHash);
  return { txHash, marketPda: marketPda.toBase58() };
}

// ─── Admin: Resolve Market ────────────────────────────────────────────────────

async function resolveMarket({ adminPrivateKey, mongodbId, winningOption }) {
  if (!isDeployed()) { console.warn("[ArkenSolana] Not deployed"); return null; }

  const keypair = loadKeypair(adminPrivateKey);
  const program = getProgram(keypair);

  const [marketPda] = deriveMarketPDA(mongoIdToBytes32(mongodbId));
  const txHash = await program.methods
    .resolveMarket(winningOption)
    .accounts({ authority: keypair.publicKey, market: marketPda })
    .rpc();

  console.log("[ArkenSolana] Market resolved. TxHash:", txHash);
  return { txHash };
}

// ─── User: Claim Winnings ─────────────────────────────────────────────────────

async function claimWinnings({ privateKey, mongodbId }) {
  if (!isDeployed()) { console.warn("[ArkenSolana] Not deployed"); return null; }

  const keypair = loadKeypair(privateKey);
  const program = getProgram(keypair);

  const marketIdArray = mongoIdToBytes32(mongodbId);
  const [marketPda]   = deriveMarketPDA(marketIdArray);
  const [vaultPda]    = deriveVaultPDA(marketPda);
  const [positionPda] = derivePositionPDA(marketPda, keypair.publicKey);
  const usdcMint      = new PublicKey(USDC_MINT_STR);
  const userUsdcAta   = await getAssociatedTokenAddress(usdcMint, keypair.publicKey);

  const txHash = await program.methods
    .claimWinnings()
    .accounts({
      user: keypair.publicKey,
      market: marketPda,
      position: positionPda,
      vault: vaultPda,
      userUsdcAccount: userUsdcAta,
      usdcMint,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();

  console.log(`[ArkenSolana] claimWinnings tx: ${txHash}`);
  return { txHash, walletAddress: keypair.publicKey.toBase58() };
}

// ─── Admin: Close Market ──────────────────────────────────────────────────────

async function closeMarket({ adminPrivateKey, mongodbId }) {
  if (!isDeployed()) { console.warn("[ArkenSolana] Not deployed"); return null; }

  const keypair = loadKeypair(adminPrivateKey);
  const program = getProgram(keypair);

  const [marketPda] = deriveMarketPDA(mongoIdToBytes32(mongodbId));
  const txHash = await program.methods
    .closeMarket()
    .accounts({ authority: keypair.publicKey, market: marketPda })
    .signers([keypair])
    .rpc();

  console.log("[ArkenSolana] Market closed. TxHash:", txHash);
  return { txHash };
}

// ─── Read: Market State ───────────────────────────────────────────────────────

async function getMarketState(mongodbId) {
  if (!isDeployed()) return null;
  try {
    const keypair = Keypair.generate();
    const program = getProgram(keypair);
    const [marketPda] = deriveMarketPDA(mongoIdToBytes32(mongodbId));
    const acc = await program.account.market.fetch(marketPda);

    const count = acc.outcomeCount;
    const pools = acc.pools.slice(0, count).map(p => p.toNumber() / 10 ** USDC_DECIMALS);
    const totalPool = pools.reduce((a, b) => a + b, 0);

    return {
      pools,
      outcomeCount: count,
      totalPool,
      prices: pools.map(p => totalPool === 0 ? 1 / count : p / totalPool),
      status: acc.status,
      winningOption: acc.winningOption,
      creatorFeePool:  acc.creatorFeePool.toNumber()  / 10 ** USDC_DECIMALS,
      lpFeePool:       acc.lpFeePool.toNumber()        / 10 ** USDC_DECIMALS,
      treasuryFeePool: acc.treasuryFeePool.toNumber()  / 10 ** USDC_DECIMALS,
    };
  } catch (err) {
    console.error("[ArkenSolana] getMarketState failed:", err?.message);
    return null;
  }
}

// ─── Read: USDC Balance ───────────────────────────────────────────────────────

async function getUsdcBalance(address) {
  try {
    const connection = getConnection();
    const pubKey  = new PublicKey(address);
    const usdcMint = new PublicKey(USDC_MINT_STR || "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
    const ata = await getAssociatedTokenAddress(usdcMint, pubKey);
    const account = await connection.getTokenAccountBalance(ata);
    return account.value.uiAmount || 0;
  } catch {
    return 0;
  }
}

// ─── Admin: Fund Gas (SOL) ────────────────────────────────────────────────────

async function fundGas({ adminPrivateKey, toAddress, amountSol = 0.005 }) {
  const adminKeypair = loadKeypair(adminPrivateKey);
  const connection = getConnection();
  const toPubkey = new PublicKey(toAddress);
  const lamports = Math.floor(amountSol * LAMPORTS_PER_SOL);

  const transaction = new Transaction().add(
    SystemProgram.transfer({ fromPubkey: adminKeypair.publicKey, toPubkey, lamports })
  );

  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = adminKeypair.publicKey;
  transaction.sign(adminKeypair);

  const txHash = await connection.sendRawTransaction(transaction.serialize());
  await connection.confirmTransaction(txHash, "confirmed");
  return { txHash, walletAddress: adminKeypair.publicKey.toBase58() };
}

module.exports = {
  placeBet,
  sellPosition,
  addLiquidity,
  claimWinnings,
  createMarket,
  closeMarket,
  resolveMarket,
  getMarketState,
  getUsdcBalance,
  fundGas,
  mongoIdToBytes32,
  isDeployed,
};
