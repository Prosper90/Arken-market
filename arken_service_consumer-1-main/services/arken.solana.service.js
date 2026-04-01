/**
 * Arken Solana Service
 * Handles on-chain bet placement and market management on the Solana Anchor program.
 *
 * Requires after anchor build + deploy:
 *   ARKEN_PROGRAM_ID  — deployed program ID
 *   SOLANA_RPC_URL    — Solana RPC (devnet or mainnet)
 *   SOLANA_USDC_MINT  — USDC mint on Solana
 */

const { Connection, PublicKey, Keypair, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction, LAMPORTS_PER_SOL } = require("@solana/web3.js");
const { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } = require("@solana/spl-token");
const anchor = require("@coral-xyz/anchor");
const { BN } = anchor;

// ─── Inline IDL ──────────────────────────────────────────────────────────────
// Generated from the arken_markets Anchor program. Update after anchor build if needed.

const IDL = {
  version: "0.1.0",
  name: "arken_markets",
  instructions: [
    {
      name: "createMarket",
      accounts: [
        { name: "authority", isMut: true, isSigner: true },
        { name: "market", isMut: true, isSigner: false },
        { name: "vault", isMut: true, isSigner: false },
        { name: "usdcMint", isMut: false, isSigner: false },
        { name: "tokenProgram", isMut: false, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false },
        { name: "rent", isMut: false, isSigner: false },
      ],
      args: [{ name: "params", type: { defined: { name: "CreateMarketParams" } } }],
    },
    {
      name: "addLiquidity",
      accounts: [
        { name: "user", isMut: true, isSigner: true },
        { name: "market", isMut: true, isSigner: false },
        { name: "lpPosition", isMut: true, isSigner: false },
        { name: "vault", isMut: true, isSigner: false },
        { name: "userUsdcAccount", isMut: true, isSigner: false },
        { name: "usdcMint", isMut: false, isSigner: false },
        { name: "tokenProgram", isMut: false, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [{ name: "params", type: { defined: { name: "AddLiquidityParams" } } }],
    },
    {
      name: "sellOption",
      accounts: [
        { name: "user", isMut: true, isSigner: true },
        { name: "market", isMut: true, isSigner: false },
        { name: "position", isMut: true, isSigner: false },
        { name: "vault", isMut: true, isSigner: false },
        { name: "userUsdcAccount", isMut: true, isSigner: false },
        { name: "usdcMint", isMut: false, isSigner: false },
        { name: "tokenProgram", isMut: false, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [{ name: "params", type: { defined: { name: "SellOptionParams" } } }],
    },
    {
      name: "closeMarket",
      accounts: [
        { name: "authority", isMut: true, isSigner: true },
        { name: "market", isMut: true, isSigner: false },
      ],
      args: [],
    },
    {
      name: "claimLpPosition",
      accounts: [
        { name: "user", isMut: true, isSigner: true },
        { name: "market", isMut: false, isSigner: false },
        { name: "lpPosition", isMut: true, isSigner: false },
        { name: "vault", isMut: true, isSigner: false },
        { name: "userUsdcAccount", isMut: true, isSigner: false },
        { name: "usdcMint", isMut: false, isSigner: false },
        { name: "tokenProgram", isMut: false, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [{ name: "params", type: { defined: { name: "ClaimLpPositionParams" } } }],
    },
    {
      name: "placeBet",
      accounts: [
        { name: "user", isMut: true, isSigner: true },
        { name: "market", isMut: true, isSigner: false },
        { name: "position", isMut: true, isSigner: false },
        { name: "vault", isMut: true, isSigner: false },
        { name: "userUsdcAccount", isMut: true, isSigner: false },
        { name: "usdcMint", isMut: false, isSigner: false },
        { name: "tokenProgram", isMut: false, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [{ name: "params", type: { defined: { name: "PlaceBetParams" } } }],
    },
    {
      name: "resolveMarket",
      accounts: [
        { name: "authority", isMut: true, isSigner: true },
        { name: "market", isMut: true, isSigner: false },
      ],
      args: [{ name: "winningOption", type: "u8" }],
    },
    {
      name: "claimWinnings",
      accounts: [
        { name: "user", isMut: true, isSigner: true },
        { name: "market", isMut: false, isSigner: false },
        { name: "position", isMut: true, isSigner: false },
        { name: "vault", isMut: true, isSigner: false },
        { name: "userUsdcAccount", isMut: true, isSigner: false },
        { name: "usdcMint", isMut: false, isSigner: false },
        { name: "tokenProgram", isMut: false, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false },
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
          { name: "authority", type: "publicKey" },
          { name: "marketId", type: { array: ["u8", 32] } },
          { name: "pools", type: { array: ["u64", 10] } },
          { name: "outcomeCount", type: "u8" },
          { name: "platformFeePool", type: "u64" },
          { name: "lpFeePool", type: "u64" },
          { name: "totalLpShares", type: "u64" },
          { name: "endTime", type: "i64" },
          { name: "status", type: "u8" },
          { name: "winningOption", type: "u8" },
          { name: "bump", type: "u8" },
          { name: "vaultBump", type: "u8" },
        ],
      },
    },
    {
      name: "Position",
      type: {
        kind: "struct",
        fields: [
          { name: "user", type: "publicKey" },
          { name: "market", type: "publicKey" },
          { name: "option", type: "u8" },
          { name: "shares", type: "u64" },
          { name: "claimed", type: "bool" },
          { name: "bump", type: "u8" },
        ],
      },
    },
    {
      name: "LpPosition",
      type: {
        kind: "struct",
        fields: [
          { name: "user", type: "publicKey" },
          { name: "market", type: "publicKey" },
          { name: "lpShares", type: "u64" },
          { name: "claimed", type: "bool" },
          { name: "bump", type: "u8" },
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
          { name: "marketId", type: { array: ["u8", 32] } },
          { name: "endTime", type: "i64" },
          { name: "outcomeCount", type: "u8" },
        ],
      },
    },
    {
      name: "PlaceBetParams",
      type: {
        kind: "struct",
        fields: [
          { name: "marketId", type: { array: ["u8", 32] } },
          { name: "option", type: "u8" },
          { name: "amount", type: "u64" },
        ],
      },
    },
    {
      name: "AddLiquidityParams",
      type: {
        kind: "struct",
        fields: [
          { name: "marketId", type: { array: ["u8", 32] } },
          { name: "amount", type: "u64" },
        ],
      },
    },
    {
      name: "SellOptionParams",
      type: {
        kind: "struct",
        fields: [
          { name: "marketId", type: { array: ["u8", 32] } },
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
    { code: 6000, name: "MarketNotOpen", msg: "Market is not open for betting" },
    { code: 6001, name: "MarketAlreadyResolved", msg: "Market has already been resolved" },
    { code: 6002, name: "MarketNotEnded", msg: "Market has not been resolved yet" },
    { code: 6003, name: "InvalidOption", msg: "Invalid option index" },
    { code: 6004, name: "BetTooLow", msg: "Amount is too low" },
    { code: 6005, name: "NoWinnings", msg: "No winnings or shares to claim" },
    { code: 6006, name: "AlreadyClaimed", msg: "Already claimed" },
    { code: 6007, name: "Unauthorized", msg: "Only the market authority can perform this action" },
    { code: 6008, name: "MarketExpired", msg: "Market has expired" },
    { code: 6009, name: "InvalidOutcomeCount", msg: "Outcome count must be between 2 and 10" },
    { code: 6010, name: "NoShares", msg: "Position has no shares" },
  ],
};

// ─── Config ───────────────────────────────────────────────────────────────────

const PROGRAM_ID_STR = process.env.ARKEN_PROGRAM_ID || "";
const RPC_URL = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
const USDC_MINT_STR = process.env.SOLANA_USDC_MINT || "";
const USDC_DECIMALS = 6;

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

/**
 * Load a Keypair from either:
 *   - A JSON array string: "[1,2,3,...]"  (Solana standard format)
 *   - A base58 private key string
 */
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
  return new anchor.Program(IDL, programId, provider);
}

function deriveMarketPDA(marketIdArray) {
  const programId = new PublicKey(PROGRAM_ID_STR);
  return PublicKey.findProgramAddressSync(
    [Buffer.from("market"), Buffer.from(marketIdArray)],
    programId
  );
}

function deriveVaultPDA(marketPda) {
  const programId = new PublicKey(PROGRAM_ID_STR);
  return PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), marketPda.toBuffer()],
    programId
  );
}

function derivePositionPDA(marketPda, userPubkey) {
  const programId = new PublicKey(PROGRAM_ID_STR);
  return PublicKey.findProgramAddressSync(
    [Buffer.from("position"), marketPda.toBuffer(), userPubkey.toBuffer()],
    programId
  );
}

/**
 * Convert a MongoDB _id string to a 32-byte array (for market_id PDA seed).
 * Zero-pads or truncates to exactly 32 bytes.
 */
function mongoIdToBytes32(mongodbId) {
  const bytes = Buffer.alloc(32, 0);
  const src = Buffer.from(mongodbId.slice(0, 32), "utf8");
  src.copy(bytes, 0, 0, Math.min(src.length, 32));
  return Array.from(bytes);
}

// ─── Core: Place Bet ──────────────────────────────────────────────────────────

/**
 * Place a bet on a Solana market using a custodial wallet.
 *
 * @param {object} params
 * @param {string} params.privateKey     - User's Solana private key (JSON array string or base58)
 * @param {string} params.mongodbId      - Market's MongoDB _id (used to derive PDA)
 * @param {number} params.optionIndex    - 0 = Yes, 1 = No
 * @param {number} params.amountUsdc     - Human-readable USDC amount (e.g. 10.5)
 * @returns {Promise<{ txHash: string, walletAddress: string }>}
 */
async function placeBet({ privateKey, mongodbId, optionIndex, amountUsdc }) {
  if (!isDeployed()) {
    console.warn("[ArkenSolana] Program not deployed — skipping on-chain bet");
    return null;
  }

  const keypair = loadKeypair(privateKey);
  const program = getProgram(keypair);

  const marketIdArray = mongoIdToBytes32(mongodbId);
  const amountLamports = new BN(Math.round(amountUsdc * 10 ** USDC_DECIMALS));

  const [marketPda] = deriveMarketPDA(marketIdArray);
  const [vaultPda] = deriveVaultPDA(marketPda);
  const [positionPda] = derivePositionPDA(marketPda, keypair.publicKey);

  const usdcMint = new PublicKey(USDC_MINT_STR);
  const userUsdcAta = await getAssociatedTokenAddress(usdcMint, keypair.publicKey);

  const txHash = await program.methods
    .placeBet({ marketId: marketIdArray, option: optionIndex, amount: amountLamports })
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

  console.log("[ArkenSolana] Bet placed. TxHash:", txHash);
  return { txHash, walletAddress: keypair.publicKey.toBase58() };
}

// ─── Admin: Create Market ─────────────────────────────────────────────────────

/**
 * Deploy a new market on Solana. Called when admin activates a market.
 *
 * @param {object} params
 * @param {string} params.adminPrivateKey  - Admin Solana keypair (JSON array or base58)
 * @param {string} params.mongodbId        - MongoDB _id to use as market_id seed
 * @param {number} params.endTimestamp     - Unix timestamp (seconds)
 * @returns {Promise<{ txHash: string, marketPda: string }>}
 */
async function createMarket({ adminPrivateKey, mongodbId, endTimestamp, outcomeCount = 2 }) {
  if (!isDeployed()) {
    console.warn("[ArkenSolana] Program not deployed — skipping market creation");
    return null;
  }

  const keypair = loadKeypair(adminPrivateKey);
  const program = getProgram(keypair);

  const marketIdArray = mongoIdToBytes32(mongodbId);
  const [marketPda] = deriveMarketPDA(marketIdArray);
  const [vaultPda] = deriveVaultPDA(marketPda);
  const usdcMint = new PublicKey(USDC_MINT_STR);

  // outcomeCount must be 2-10 (Anchor program enforces this)
  const safeOutcomeCount = Math.max(2, Math.min(10, outcomeCount));

  const txHash = await program.methods
    .createMarket({
      marketId: marketIdArray,
      endTime: new BN(endTimestamp.toString()),
      outcomeCount: safeOutcomeCount,
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

/**
 * Resolve a Solana market with the winning option.
 */
async function resolveMarket({ adminPrivateKey, mongodbId, winningOption }) {
  if (!isDeployed()) {
    console.warn("[ArkenSolana] Program not deployed — skipping resolve");
    return null;
  }

  const keypair = loadKeypair(adminPrivateKey);
  const program = getProgram(keypair);

  const marketIdArray = mongoIdToBytes32(mongodbId);
  const [marketPda] = deriveMarketPDA(marketIdArray);

  const txHash = await program.methods
    .resolveMarket(winningOption)
    .accounts({
      authority: keypair.publicKey,
      market: marketPda,
    })
    .rpc();

  console.log("[ArkenSolana] Market resolved. TxHash:", txHash);
  return { txHash };
}

// ─── User: Claim Winnings ─────────────────────────────────────────────────────

/**
 * Claim winnings for a user after a Solana market resolves.
 * Must be called with the USER's custodial private key.
 *
 * @param {object} params
 * @param {string} params.privateKey  - User's Solana private key (JSON array string or base58)
 * @param {string} params.mongodbId   - Market's MongoDB _id
 * @returns {Promise<{ txHash: string, walletAddress: string } | null>}
 */
async function claimWinnings({ privateKey, mongodbId }) {
  if (!isDeployed()) {
    console.warn("[ArkenSolana] Program not deployed — skipping claimWinnings");
    return null;
  }

  const keypair = loadKeypair(privateKey);
  const program = getProgram(keypair);

  const marketIdArray = mongoIdToBytes32(mongodbId);
  const [marketPda] = deriveMarketPDA(marketIdArray);
  const [vaultPda] = deriveVaultPDA(marketPda);
  const [positionPda] = derivePositionPDA(marketPda, keypair.publicKey);

  const usdcMint = new PublicKey(USDC_MINT_STR);
  const userUsdcAta = await getAssociatedTokenAddress(usdcMint, keypair.publicKey);

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

  console.log(`[ArkenSolana] claimWinnings tx: ${txHash} from ${keypair.publicKey.toBase58()}`);
  return { txHash, walletAddress: keypair.publicKey.toBase58() };
}

// ─── Admin: Close Market Early ────────────────────────────────────────────────

/**
 * Early-close a Solana market before its endTime.
 * Only the market authority (admin keypair) can call this.
 *
 * @param {object} params
 * @param {string} params.adminPrivateKey  - Admin Solana keypair
 * @param {string} params.mongodbId        - Market's MongoDB _id
 * @returns {Promise<{ txHash: string } | null>}
 */
async function closeMarket({ adminPrivateKey, mongodbId }) {
  if (!isDeployed()) {
    console.warn("[ArkenSolana] Program not deployed — skipping closeMarket");
    return null;
  }

  const keypair = loadKeypair(adminPrivateKey);
  const program = getProgram(keypair);

  const marketIdArray = mongoIdToBytes32(mongodbId);
  const [marketPda] = deriveMarketPDA(marketIdArray);

  const txHash = await program.methods
    .closeMarket()
    .accounts({
      authority: keypair.publicKey,
      market: marketPda,
    })
    .signers([keypair])
    .rpc();

  console.log("[ArkenSolana] Market closed early. TxHash:", txHash);
  return { txHash };
}

// ─── Read: Market State ───────────────────────────────────────────────────────

async function getMarketState(mongodbId) {
  if (!isDeployed()) return null;
  try {
    const keypair = Keypair.generate(); // read-only, no signing needed
    const program = getProgram(keypair);
    const marketIdArray = mongoIdToBytes32(mongodbId);
    const [marketPda] = deriveMarketPDA(marketIdArray);
    const marketAcc = await program.account.market.fetch(marketPda);
    const outcomeCount = marketAcc.outcomeCount;
    const pools = marketAcc.pools.slice(0, outcomeCount).map(p => p.toNumber() / 10 ** USDC_DECIMALS);
    const totalPool = pools.reduce((a, b) => a + b, 0);
    return {
      pools,
      outcomeCount,
      totalPool,
      prices: pools.map(p => totalPool === 0 ? 1 / outcomeCount : p / totalPool),
      status: marketAcc.status,
      winningOption: marketAcc.winningOption,
      platformFeePool: marketAcc.platformFeePool.toNumber() / 10 ** USDC_DECIMALS,
      lpFeePool: marketAcc.lpFeePool.toNumber() / 10 ** USDC_DECIMALS,
    };
  } catch (err) {
    console.error("[ArkenSolana] getMarketState failed:", err?.message);
    return null;
  }
}

/**
 * Get USDC token balance for a Solana wallet address.
 * Returns 0 if the ATA doesn't exist yet (no USDC deposited).
 * @param {string} address - Solana base58 public key
 * @returns {Promise<number>} USDC balance as human-readable float
 */
async function getUsdcBalance(address) {
  try {
    const connection = getConnection();
    const pubKey = new PublicKey(address);
    const usdcMint = new PublicKey(USDC_MINT_STR || "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
    const ata = await getAssociatedTokenAddress(usdcMint, pubKey);
    const account = await connection.getTokenAccountBalance(ata);
    return account.value.uiAmount || 0;
  } catch {
    // ATA doesn't exist yet — wallet has never received USDC
    return 0;
  }
}

async function fundGas({ adminPrivateKey, toAddress, amountSol = 0.005 }) {
  const adminKeypair = loadKeypair(adminPrivateKey);
  const connection = getConnection();
  const toPubkey = new PublicKey(toAddress);
  const lamports = Math.floor(amountSol * LAMPORTS_PER_SOL);

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: adminKeypair.publicKey,
      toPubkey,
      lamports,
    })
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
  claimWinnings,
  createMarket,
  closeMarket,
  resolveMarket,
  getMarketState,
  mongoIdToBytes32,
  isDeployed,
  fundGas,
  getUsdcBalance,
};
