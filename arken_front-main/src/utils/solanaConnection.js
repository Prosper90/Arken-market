import { Connection } from "@solana/web3.js";

// Ordered list of Solana mainnet RPC endpoints.
// Free public endpoints come first so the rate-limited Helius key is only
// tried as a last resort.
const RPC_ENDPOINTS = [
  "https://api.mainnet-beta.solana.com",      // Official Solana public — free
  "https://rpc.ankr.com/solana",              // Ankr public — free, reliable
  "https://solana-mainnet.rpc.extrnode.com",  // ExtrNode public — free
  // Helius (free-tier key — may hit rate limits): kept as last resort
  "https://mainnet.helius-rpc.com/?api-key=05031ac5-0873-42a5-bb11-1c124bb119b0",
];

// Cache the last working endpoint index so we don't restart from index 0 every time
let _lastWorkingIdx = 0;

function isRateLimitError(err) {
  const msg = err?.message || "";
  return (
    msg.includes("429") ||
    msg.includes("Too Many") ||
    msg.includes("max usage") ||
    msg.includes("-32429")
  );
}

/**
 * Returns a working Solana Connection with fallback across multiple RPCs.
 * Uses `getSlot()` (lightweight) to probe each endpoint.
 *
 * @param {string} commitment
 * @returns {Promise<Connection>}
 */
export async function getSolanaConnection(commitment = "confirmed") {
  const total = RPC_ENDPOINTS.length;

  for (let i = 0; i < total; i++) {
    const idx = (_lastWorkingIdx + i) % total;
    const endpoint = RPC_ENDPOINTS[idx];
    try {
      const conn = new Connection(endpoint, commitment);
      await conn.getSlot(); // lightweight health-check
      _lastWorkingIdx = idx;
      console.log(`Solana RPC: using ${endpoint}`);
      return conn;
    } catch (err) {
      console.warn(
        `Solana RPC [${endpoint.slice(8, 40)}…] failed (${
          isRateLimitError(err) ? "rate-limited" : err?.message?.slice(0, 50)
        }), trying next…`
      );
    }
  }

  // All endpoints failed — return a connection anyway (caller will get the real error)
  console.error("All Solana RPC endpoints failed. Returning default.");
  return new Connection(RPC_ENDPOINTS[0], commitment);
}

/**
 * Returns a working Solana Connection AND a fresh blockhash together,
 * saving one RPC round-trip when the caller needs a blockhash anyway.
 *
 * @param {string} commitment
 * @returns {Promise<{connection: Connection, blockhash: string, lastValidBlockHeight: number}>}
 */
export async function getSolanaConnectionWithBlockhash(commitment = "confirmed") {
  const total = RPC_ENDPOINTS.length;

  for (let i = 0; i < total; i++) {
    const idx = (_lastWorkingIdx + i) % total;
    const endpoint = RPC_ENDPOINTS[idx];
    try {
      const conn = new Connection(endpoint, commitment);
      const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash();
      _lastWorkingIdx = idx;
      console.log(`Solana RPC: using ${endpoint}`);
      return { connection: conn, blockhash, lastValidBlockHeight };
    } catch (err) {
      console.warn(
        `Solana RPC [${endpoint.slice(8, 40)}…] failed (${
          isRateLimitError(err) ? "rate-limited" : err?.message?.slice(0, 50)
        }), trying next…`
      );
    }
  }

  // All endpoints failed
  const conn = new Connection(RPC_ENDPOINTS[0], commitment);
  const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash();
  return { connection: conn, blockhash, lastValidBlockHeight };
}
