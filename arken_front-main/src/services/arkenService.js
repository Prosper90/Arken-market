/**
 * Arken EVM Service
 * Direct integration with our own ArkenFactory + ArkenMarket contracts on Arbitrum.
 * Replaces the Rain Protocol SDK.
 *
 * Contracts (set in .env):
 *   VITE_ARKEN_FACTORY_ADDRESS  — ArkenFactory contract address
 *   VITE_ARB_RPC_URL            — Arbitrum RPC (e.g. https://arb1.arbitrum.io/rpc)
 *   VITE_USDT_ADDRESS           — USDT on Arbitrum: 0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9
 */

import { ethers } from "ethers";

// ─── ABIs (minimal) ─────────────────────────────────────────────────────────

const FACTORY_ABI = [
  "function getAllMarkets() view returns (address[])",
  "function getMarketsCount() view returns (uint256)",
  "function marketById(bytes32) view returns (address)",
  "event MarketCreated(address indexed market, bytes32 indexed marketId, uint256 endTime, uint8 outcomeCount)",
];

const MARKET_ABI = [
  "function marketId() view returns (bytes32)",
  "function endTime() view returns (uint256)",
  "function outcomeCount() view returns (uint8)",
  "function status() view returns (uint8)",
  "function winningOption() view returns (uint8)",
  "function platformFeePool() view returns (uint256)",
  "function lpFeePool() view returns (uint256)",
  "function totalLpDeposit() view returns (uint256)",
  "function getPrice() view returns (uint256 p0, uint256 p1)",
  "function getTotalPool() view returns (uint256)",
  "function getMarketInfo() view returns (bytes32, uint256, uint8, uint8, uint8, uint256, uint256, uint256, uint256)",
  "function getPrices() view returns (uint256[] memory)",
  "function addLiquidity(uint256 amount) external",
  "function claimLpPosition() external",
  "function getLpInfo(address provider) view returns (uint256, uint256, bool)",
  "function getPool(uint8 outcome) view returns (uint256)",
  "function getUserShares(address user, uint8 outcome) view returns (uint256)",
  "function buyOption(uint8 option, uint256 amount)",
  "function resolveMarket(uint8 winningOption)",
  "function claimWinnings()",
  "function closeMarket()",
  "event EnterOption(address indexed user, uint8 indexed option, uint256 amountIn, uint256 shares)",
  "event ChooseWinner(uint8 winningOption)",
  "event ClosePool()",
  "event Claim(address indexed user, uint256 payout)",
];

const ERC20_ABI = [
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address) view returns (uint256)",
];

// ─── Config ─────────────────────────────────────────────────────────────────

const ARB_RPC = import.meta.env.VITE_ARB_RPC_URL || "https://arb1.arbitrum.io/rpc";
const FACTORY_ADDRESS = import.meta.env.VITE_ARKEN_FACTORY_ADDRESS || "";
const USDT_ADDRESS = import.meta.env.VITE_USDT_ADDRESS || "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9";
export const USDT_DECIMALS = 6;

let _provider = null;
function getProvider() {
  if (!_provider) _provider = new ethers.JsonRpcProvider(ARB_RPC);
  return _provider;
}

function getFactory() {
  return new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, getProvider());
}

function getMarket(address) {
  return new ethers.Contract(address, MARKET_ABI, getProvider());
}

// ─── Market Queries ──────────────────────────────────────────────────────────

/**
 * Fetch all deployed Arken markets with their current state.
 * Returns normalized objects compatible with Home.jsx and MarketDetails.jsx.
 */
export async function getArkenMarkets() {
  try {
    if (!FACTORY_ADDRESS) return [];
    const factory = getFactory();
    const addresses = await factory.getAllMarkets();
    const markets = await Promise.all(addresses.map(fetchArkenMarket));
    return markets.filter(Boolean);
  } catch (err) {
    console.error("[Arken] getArkenMarkets failed:", err?.message);
    return [];
  }
}

/**
 * Fetch and normalize a single market by contract address.
 */
export async function fetchArkenMarket(marketAddress) {
  try {
    const market = getMarket(marketAddress);
    const [marketIdBytes, endTime, outcomeCount, status, winningOption, totalPoolWei] =
      await market.getMarketInfo();

    const totalPool = Number(ethers.formatUnits(totalPoolWei, USDT_DECIMALS));

    // Fetch per-outcome prices
    let outcomePrices = [0.5, 0.5];
    try {
      const pricesRaw = await market.getPrices();
      outcomePrices = pricesRaw.map(p => Number(p) / 1e18);
    } catch {}

    const statusMap = { 0: "active", 1: "closed", 2: "resolved" };
    const marketStatus = statusMap[status] || "closed";

    // Convert bytes32 marketId to hex string for MongoDB lookup
    const marketIdHex = ethers.hexlify(marketIdBytes);

    return {
      _id: `arken_${marketAddress.toLowerCase()}`,
      source: "arken",
      question: "", // filled from MongoDB via backend
      description: "",
      category: "Other",
      image: null,
      outcomes: Array.from({ length: Number(outcomeCount) }, (_, i) => i === 0 ? "Yes" : i === 1 ? "No" : `Outcome ${i + 1}`),
      outcomePrices,
      chancePercents: outcomePrices.map(p => Math.round(p * 100)),
      marketStatus,
      active: marketStatus === "active",
      endDate: new Date(Number(endTime) * 1000).toISOString(),
      startDate: null,
      liquidity: totalPool,
      // Arken-specific
      arkenMarketAddress: marketAddress,
      arkenMarketId: marketIdHex,
      winningOption: status === 2 ? Number(winningOption) : null,
    };
  } catch (err) {
    console.error(`[Arken] fetchArkenMarket(${marketAddress}) failed:`, err?.message);
    return null;
  }
}

/**
 * Get current live prices for a market.
 * Returns array of prices as 0–1 floats (one per outcome).
 * Also returns yesPrice / noPrice for 2-outcome backward compat.
 */
export async function getArkenMarketPrices(marketAddress) {
  try {
    const market = getMarket(marketAddress);
    const pricesRaw = await market.getPrices();
    const prices = pricesRaw.map(p => Number(p) / 1e18);
    return {
      prices,
      yesPrice: prices[0] ?? 0.5,
      noPrice: prices[1] ?? 0.5,
    };
  } catch (err) {
    console.error("[Arken] getArkenMarketPrices failed:", err?.message);
    return { prices: [0.5, 0.5], yesPrice: 0.5, noPrice: 0.5 };
  }
}

/**
 * Get a user's shares on a market across all outcomes.
 * Returns an array of share amounts (in human USDT) indexed by outcome.
 */
export async function getUserShares(marketAddress, userAddress, outcomeCount = 2) {
  try {
    const market = getMarket(marketAddress);
    const results = await Promise.all(
      Array.from({ length: outcomeCount }, (_, i) =>
        market.getUserShares(userAddress, i)
      )
    );
    return results.map(raw => Number(ethers.formatUnits(raw, USDT_DECIMALS)));
  } catch (err) {
    console.error("[Arken] getUserShares failed:", err?.message);
    return Array(outcomeCount).fill(0);
  }
}

// ─── Constants ───────────────────────────────────────────────────────────────

export { USDT_ADDRESS, FACTORY_ADDRESS };

/** Convert human USDT amount to Wei bigint */
export function usdtToWei(amount) {
  return ethers.parseUnits(String(amount), USDT_DECIMALS);
}

/** Convert Wei bigint to human USDT string */
export function weiToUsdt(wei) {
  return ethers.formatUnits(wei, USDT_DECIMALS);
}

/**
 * Fetch Solana prediction markets from the backend.
 * Backend stores Solana markets in MongoDB with source="solana".
 * Returns normalized market objects compatible with Home.jsx.
 */
export async function getSolanaMarkets(apiCallFn, apiUrl) {
  // Solana markets are indexed by the backend in MongoDB.
  // They come through the normal getmergedmarkets endpoint with source="solana".
  // This is a utility to filter them client-side if needed.
  try {
    if (!apiCallFn || !apiUrl) return [];
    const resp = await apiCallFn({ apiUrl, payload: { source: "solana" } });
    if (resp?.success && Array.isArray(resp.data)) {
      return resp.data.filter(m => m.source === "solana");
    }
    return [];
  } catch (err) {
    console.error("[Arken] getSolanaMarkets failed:", err?.message);
    return [];
  }
}

export const SOLANA_USDC_DECIMALS = 6;
