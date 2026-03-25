/**
 * Arken EVM Service
 * Handles on-chain bet placement on our own ArkenMarket contracts on Arbitrum.
 * Replaces the Rain Protocol SDK integration.
 */

const { ethers } = require("ethers");

// ─── ABIs ────────────────────────────────────────────────────────────────────

const MARKET_ABI = [
  "function buyOption(uint8 option, uint256 amount) external",
  "function sellOption(uint8 option, uint256 shareAmount) external",
  "function resolveMarket(uint8 winningOption) external",
  "function claimWinnings() external",
  "function closeMarket() external",
  "function getPrice() view returns (uint256 yesPrice, uint256 noPrice)",
  "function getMarketInfo() view returns (bytes32, uint256, uint8, uint8, uint8, uint256, uint256, uint256, uint256)",
  "function getPrices() view returns (uint256[] memory)",
  "function addLiquidity(uint256 amount) external",
  "function claimLpPosition() external",
  "function getLpInfo(address provider) view returns (uint256, uint256, bool)",
  "function getPool(uint8 outcome) view returns (uint256)",
  "function getUserShares(address user, uint8 outcome) view returns (uint256)",
  "function getTotalPool() view returns (uint256)",
  "function status() view returns (uint8)",
  "function endTime() view returns (uint256)",
  "function authority() view returns (address)",
  "event ExitOption(address indexed user, uint8 indexed option, uint256 sharesSold, uint256 payout)",
];

const ERC20_ABI = [
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address) view returns (uint256)",
];

const FACTORY_ABI = [
  "function createMarket(bytes32 marketId, uint256 endTime, uint8 outcomeCount) external returns (address)",
  "function getAllMarkets() view returns (address[])",
  "function marketById(bytes32) view returns (address)",
  "event MarketCreated(address indexed market, bytes32 indexed marketId, uint256 endTime, uint8 outcomeCount)",
];

// ─── Config ───────────────────────────────────────────────────────────────────

const ARB_RPC = process.env.ARB_RPC || "https://arb1.arbitrum.io/rpc";
const USDT_ADDRESS = process.env.USDT_ADDRESS || "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9";
const FACTORY_ADDRESS = process.env.ARKEN_FACTORY_ADDRESS || "";
const USDT_DECIMALS = 6;

const provider = new ethers.JsonRpcProvider(ARB_RPC);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getSignerFromPrivateKey(privateKey) {
  return new ethers.Wallet(privateKey, provider);
}

function getMarketContract(marketAddress, signerOrProvider) {
  return new ethers.Contract(marketAddress, MARKET_ABI, signerOrProvider || provider);
}

function getUsdtContract(signerOrProvider) {
  return new ethers.Contract(USDT_ADDRESS, ERC20_ABI, signerOrProvider || provider);
}

function getFactoryContract(signerOrProvider) {
  if (!FACTORY_ADDRESS) throw new Error("ARKEN_FACTORY_ADDRESS not set");
  return new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, signerOrProvider || provider);
}

// ─── Core: Place Bet ─────────────────────────────────────────────────────────

/**
 * Place a bet on an Arken market using a custodial wallet.
 *
 * @param {object} params
 * @param {string} params.privateKey          - User's custodial Arbitrum private key
 * @param {string} params.marketAddress       - ArkenMarket contract address
 * @param {number} params.optionIndex         - 0 = Yes, 1 = No
 * @param {number} params.amountUsdt          - Human-readable USDT amount (e.g. 10.5)
 * @returns {Promise<{ txHash: string, walletAddress: string }>}
 */
async function placeBet({ privateKey, marketAddress, optionIndex, amountUsdt }) {
  if (!privateKey) throw new Error("No private key provided");
  if (!marketAddress) throw new Error("No market address provided");
  if (typeof optionIndex !== "number" || optionIndex < 0) throw new Error("Invalid option index");

  const signer = getSignerFromPrivateKey(privateKey);
  const amountWei = ethers.parseUnits(String(amountUsdt), USDT_DECIMALS);

  // Step 1: Check and set USDT allowance
  const usdt = getUsdtContract(signer);
  const currentAllowance = await usdt.allowance(signer.address, marketAddress);

  if (currentAllowance < amountWei) {
    console.log(`[ArkenEVM] Approving USDT for market ${marketAddress}...`);
    const approveTx = await usdt.approve(marketAddress, ethers.MaxUint256);
    await approveTx.wait(1);
    console.log("[ArkenEVM] USDT approved");
  }

  // Step 2: Buy option
  const market = getMarketContract(marketAddress, signer);
  console.log(`[ArkenEVM] Placing bet: option=${optionIndex}, amount=${amountUsdt} USDT`);

  const buyTx = await market.buyOption(optionIndex, amountWei);
  const receipt = await buyTx.wait(1);

  console.log("[ArkenEVM] Bet placed. TxHash:", receipt.hash);
  return {
    txHash: receipt.hash,
    walletAddress: signer.address,
  };
}

// ─── Admin: Create Market ─────────────────────────────────────────────────────

/**
 * Create a new market on Arbitrum via the ArkenFactory.
 * Called by admin backend when a new market is added to MongoDB.
 *
 * @param {object} params
 * @param {string} params.adminPrivateKey   - Admin wallet private key
 * @param {string} params.mongodbId         - MongoDB _id as string (will be padded to bytes32)
 * @param {number} params.endTimestamp      - Unix timestamp (seconds)
 * @returns {Promise<{ txHash: string, marketAddress: string }>}
 */
async function createMarket({ adminPrivateKey, mongodbId, endTimestamp, outcomeCount }) {
  const signer = getSignerFromPrivateKey(adminPrivateKey);
  const factory = getFactoryContract(signer);

  // Convert mongodbId string to bytes32 (zero-padded)
  const marketIdBytes = ethers.zeroPadBytes(
    ethers.toUtf8Bytes(mongodbId.slice(0, 32)),
    32
  );

  const resolvedOutcomeCount = outcomeCount || 2;
  const tx = await factory.createMarket(marketIdBytes, endTimestamp, resolvedOutcomeCount);
  const receipt = await tx.wait(1);

  // Parse MarketCreated event to get market address
  const iface = new ethers.Interface(FACTORY_ABI);
  let marketAddress = null;
  for (const log of receipt.logs) {
    try {
      const parsed = iface.parseLog(log);
      if (parsed?.name === "MarketCreated") {
        marketAddress = parsed.args.market;
        break;
      }
    } catch {}
  }

  return { txHash: receipt.hash, marketAddress };
}

// ─── Admin: Seed Initial Liquidity ───────────────────────────────────────────

/**
 * Seed a newly deployed market with initial liquidity from the admin wallet.
 * Called right after createMarket() succeeds if initialLiquidity > 0.
 *
 * @param {object} params
 * @param {string} params.adminPrivateKey
 * @param {string} params.marketAddress
 * @param {number} params.amountUsdt       - Human-readable USDT (e.g. 100)
 * @returns {Promise<{ txHash: string }>}
 */
async function seedLiquidity({ adminPrivateKey, marketAddress, amountUsdt }) {
  if (!amountUsdt || Number(amountUsdt) <= 0) return { txHash: null };

  const signer = getSignerFromPrivateKey(adminPrivateKey);
  const amountWei = ethers.parseUnits(String(amountUsdt), USDT_DECIMALS);

  // Ensure admin wallet has approved the market to spend USDT
  const usdt = getUsdtContract(signer);
  const currentAllowance = await usdt.allowance(signer.address, marketAddress);
  if (currentAllowance < amountWei) {
    const approveTx = await usdt.approve(marketAddress, ethers.MaxUint256);
    await approveTx.wait(1);
  }

  const market = getMarketContract(marketAddress, signer);
  const tx = await market.addLiquidity(amountWei);
  const receipt = await tx.wait(1);

  console.log(`[ArkenEVM] Seeded ${amountUsdt} USDT liquidity. TxHash:`, receipt.hash);
  return { txHash: receipt.hash };
}

// ─── Admin: Resolve Market ────────────────────────────────────────────────────

/**
 * Resolve a market with the winning option.
 *
 * @param {object} params
 * @param {string} params.adminPrivateKey
 * @param {string} params.marketAddress
 * @param {number} params.winningOption  - 0=Yes, 1=No
 * @returns {Promise<{ txHash: string }>}
 */
async function resolveMarket({ adminPrivateKey, marketAddress, winningOption }) {
  const signer = getSignerFromPrivateKey(adminPrivateKey);
  const market = getMarketContract(marketAddress, signer);

  const tx = await market.resolveMarket(winningOption);
  const receipt = await tx.wait(1);

  return { txHash: receipt.hash };
}

// ─── User: Claim Winnings ────────────────────────────────────────────────────

/**
 * Claim winnings for a user after a market resolves.
 * Must be called with the USER's custodial private key so USDT lands in their wallet.
 *
 * @param {object} params
 * @param {string} params.privateKey     - User's custodial Arbitrum private key
 * @param {string} params.marketAddress  - ArkenMarket contract address
 * @returns {Promise<{ txHash: string, walletAddress: string }>}
 */
async function claimWinnings({ privateKey, marketAddress }) {
  const signer = getSignerFromPrivateKey(privateKey);
  const market = getMarketContract(marketAddress, signer);
  const tx = await market.claimWinnings();
  const receipt = await tx.wait(1);
  console.log(`[ArkenEVM] claimWinnings tx: ${receipt.hash} from ${signer.address}`);
  return { txHash: receipt.hash, walletAddress: signer.address };
}

// ─── Admin: Fund Gas ──────────────────────────────────────────────────────────

/**
 * Send a small amount of ETH to a new user custodial wallet to cover gas fees.
 * Arbitrum gas is very cheap (~$0.01–0.05/tx), so 0.001 ETH covers many transactions.
 *
 * @param {object} params
 * @param {string} params.adminPrivateKey
 * @param {string} params.toAddress        - User's new custodial EVM address
 * @param {string} [params.amountEth]      - Default 0.001 ETH
 * @returns {Promise<{ txHash: string }>}
 */
async function fundGas({ adminPrivateKey, toAddress, amountEth = "0.001" }) {
  const signer = getSignerFromPrivateKey(adminPrivateKey);
  const tx = await signer.sendTransaction({
    to: toAddress,
    value: ethers.parseEther(amountEth),
  });
  await tx.wait(1);
  console.log(`[ArkenEVM] Funded ${amountEth} ETH gas to ${toAddress}`);
  return { txHash: tx.hash };
}

// ─── Read: Token Balance ─────────────────────────────────────────────────────

/**
 * Get USDT balance for a custodial wallet address.
 * @param {string} address - EVM wallet address
 * @returns {Promise<number>} USDT balance as human-readable float
 */
async function getUsdtBalance(address) {
  try {
    const usdt = getUsdtContract(provider);
    const raw = await usdt.balanceOf(address);
    return Number(ethers.formatUnits(raw, USDT_DECIMALS));
  } catch (err) {
    console.error("[ArkenEVM] getUsdtBalance error:", err.message);
    return 0;
  }
}

// ─── User: Sell Position ──────────────────────────────────────────────────────

/**
 * Sell all shares for a given option, receiving proportional USDT payout (minus 3% fee).
 * Reads the user's on-chain share balance first, then calls sellOption().
 * Parses the ExitOption event to return the actual USDT payout received.
 *
 * @param {object} params
 * @param {string} params.privateKey      - User's custodial Arbitrum private key
 * @param {string} params.marketAddress   - ArkenMarket contract address
 * @param {number} params.optionIndex     - Outcome index to sell (0=Yes, 1=No, ...)
 * @returns {Promise<{ txHash: string, walletAddress: string, payout: number }>}
 */
async function sellPosition({ privateKey, marketAddress, optionIndex }) {
  if (!privateKey) throw new Error("No private key provided");
  if (!marketAddress) throw new Error("No market address provided");
  if (typeof optionIndex !== "number" || optionIndex < 0) throw new Error("Invalid option index");

  const signer = getSignerFromPrivateKey(privateKey);
  const market = getMarketContract(marketAddress, signer);

  // Read actual on-chain shares for this user and option
  const sharesWei = await market.getUserShares(signer.address, optionIndex);
  if (sharesWei === 0n) throw new Error("No on-chain shares found for this position");

  console.log(`[ArkenEVM] Selling ${ethers.formatUnits(sharesWei, USDT_DECIMALS)} shares on option ${optionIndex}`);

  // Execute the sell — no USDT approval needed (contract pays us)
  const sellTx = await market.sellOption(optionIndex, sharesWei);
  const receipt = await sellTx.wait(1);

  // Parse ExitOption event for actual USDT payout
  const iface = new ethers.Interface([
    "event ExitOption(address indexed user, uint8 indexed option, uint256 sharesSold, uint256 payout)",
  ]);

  let payout = 0;
  for (const log of receipt.logs) {
    try {
      const parsed = iface.parseLog(log);
      if (parsed?.name === "ExitOption") {
        payout = Number(ethers.formatUnits(parsed.args.payout, USDT_DECIMALS));
        break;
      }
    } catch {}
  }

  console.log(`[ArkenEVM] Position sold. TxHash: ${receipt.hash}, payout: ${payout} USDT`);
  return { txHash: receipt.hash, walletAddress: signer.address, payout };
}

// ─── Read: Market Prices ──────────────────────────────────────────────────────

/**
 * Get current prices for a market.
 * Returns { yesPrice, noPrice } as 0–1 floats.
 */
async function getMarketPrices(marketAddress) {
  try {
    const market = getMarketContract(marketAddress);
    const [yesPriceBig, noPriceBig] = await market.getPrice();
    return {
      yesPrice: Number(yesPriceBig) / 1e18,
      noPrice: Number(noPriceBig) / 1e18,
    };
  } catch (err) {
    console.error("[ArkenEVM] getMarketPrices failed:", err?.message);
    return { yesPrice: 0.5, noPrice: 0.5 };
  }
}

module.exports = {
  placeBet,
  sellPosition,
  claimWinnings,
  createMarket,
  seedLiquidity,
  resolveMarket,
  fundGas,
  getMarketPrices,
  getSignerFromPrivateKey,
  getUsdtBalance,
  USDT_DECIMALS,
  USDT_ADDRESS,
};
