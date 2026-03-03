/**
 * UMA Oracle Service
 *
 * Integrates with UMA Protocol's Optimistic Oracle V3 for EVM-based markets.
 * UMA allows anyone to propose an answer; a 2-hour dispute window follows.
 * If undisputed, the resolution is final and funds are distributed.
 *
 * IMPORTANT: UMA is EVM-native (works on Arbitrum, Ethereum, etc.).
 * For Solana-based markets, use Pyth or Switchboard oracle instead.
 *
 * Required env vars:
 *   EVM_PRIVATE_KEY          - Admin wallet private key (pays gas)
 *   ARB_RPC_URL              - Arbitrum RPC endpoint
 *   UMA_OO_V3_ADDRESS        - OptimisticOracleV3 contract address on Arbitrum
 *                              Mainnet: 0x072819Bb43B50E7A251c64411e7aA362ce82803B
 *   UMA_DEFAULT_BOND_TOKEN   - Bond token address (USDC on Arbitrum)
 *                              Mainnet: 0xaf88d065e77c8cC2239327C5EDb3A432268e5831
 *   UMA_DEFAULT_BOND_AMOUNT  - Bond amount in token units (e.g. "100000000" for 100 USDC with 6 decimals)
 *   UMA_DISPUTE_WINDOW_SECS  - Dispute window in seconds (default 7200 = 2 hours)
 *
 * Architecture:
 *   1. Admin calls proposeResolution(marketId, verdict) → submits assertion to UMA OO
 *   2. Cron checks expired assertions (dispute window passed) → calls settleResolution()
 *   3. On settle: market is marked resolved, payouts distributed via existing payout logic
 *
 * UMA Contract reference:
 *   https://docs.uma.xyz/developers/optimistic-oracle-v3
 */

const { ethers } = require("ethers");

// Minimal ABI for UMA OptimisticOracleV3
const OO_V3_ABI = [
  // Assert a truth claim and get back an assertionId
  "function assertTruth(bytes memory claim, address asserter, address callbackRecipient, address escalationManager, uint64 liveness, address currency, uint256 bond, bytes32 identifier, bytes32 domainId) external returns (bytes32 assertionId)",
  // Settle after liveness period
  "function settleAssertion(bytes32 assertionId) external",
  // Get assertion data
  "function getAssertion(bytes32 assertionId) external view returns (tuple(address asserter, address callbackRecipient, address escalationManager, address disputer, uint64 liveness, uint256 bond, bool settled, bool settlementResolution, uint64 expirationTime, bytes32 identifier, bytes32 domainId, address currency) assertion)",
];

// Minimal ERC20 ABI for bond token approval
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
];

function getProvider() {
  return new ethers.JsonRpcProvider(process.env.ARB_RPC_URL);
}

function getAdminWallet() {
  const provider = getProvider();
  return new ethers.Wallet(process.env.EVM_PRIVATE_KEY, provider);
}

function getOOContract(signer) {
  const address = process.env.UMA_OO_V3_ADDRESS;
  if (!address) throw new Error("UMA_OO_V3_ADDRESS not set in environment");
  return new ethers.Contract(address, OO_V3_ABI, signer);
}

/**
 * Propose a market resolution to UMA OO V3.
 * Returns the assertionId (bytes32 hex string) that can be used to track + settle.
 *
 * @param {string} marketId   - MongoDB ObjectId of the market
 * @param {string} verdict    - The winning outcome text
 * @param {string} question   - Market question (included in claim for transparency)
 * @returns {string} assertionId
 */
async function proposeResolution(marketId, verdict, question) {
  const wallet = getAdminWallet();
  const oo = getOOContract(wallet);

  const bondToken = process.env.UMA_DEFAULT_BOND_TOKEN;
  const bondAmount = BigInt(process.env.UMA_DEFAULT_BOND_AMOUNT || "100000000"); // 100 USDC default
  const liveness = parseInt(process.env.UMA_DISPUTE_WINDOW_SECS || "7200"); // 2 hours default

  // Approve bond token spend if needed
  const tokenContract = new ethers.Contract(bondToken, ERC20_ABI, wallet);
  const allowance = await tokenContract.allowance(wallet.address, process.env.UMA_OO_V3_ADDRESS);
  if (allowance < bondAmount) {
    const approveTx = await tokenContract.approve(process.env.UMA_OO_V3_ADDRESS, bondAmount * 10n);
    await approveTx.wait();
    console.log("UMA: Bond token approved");
  }

  // Encode the claim as bytes
  // Format: "Market {marketId} ({question}) resolved as: {verdict}"
  const claimText = `Market ${marketId} (${question}) resolved as: ${verdict}`;
  const claim = ethers.toUtf8Bytes(claimText);

  // UMIP-7 identifier for general assertions
  const identifier = ethers.encodeBytes32String("ASSERT_TRUTH");
  const domainId = ethers.ZeroHash;

  const tx = await oo.assertTruth(
    claim,
    wallet.address,          // asserter
    ethers.ZeroAddress,      // callbackRecipient (none)
    ethers.ZeroAddress,      // escalationManager (none)
    liveness,
    bondToken,
    bondAmount,
    identifier,
    domainId
  );

  const receipt = await tx.wait();

  // Extract assertionId from logs
  const assertionId = receipt.logs[0]?.topics[1] || null;
  if (!assertionId) throw new Error("Could not extract assertionId from UMA transaction");

  console.log(`UMA: Assertion submitted for market ${marketId}, assertionId=${assertionId}`);
  return assertionId;
}

/**
 * Check if an assertion's dispute window has expired and it can be settled.
 *
 * @param {string} assertionId
 * @returns {{ canSettle: boolean, settled: boolean, resolution: boolean }}
 */
async function checkAssertionStatus(assertionId) {
  const provider = getProvider();
  const oo = new ethers.Contract(process.env.UMA_OO_V3_ADDRESS, OO_V3_ABI, provider);

  const assertion = await oo.getAssertion(assertionId);
  const now = Math.floor(Date.now() / 1000);

  return {
    canSettle: !assertion.settled && Number(assertion.expirationTime) <= now,
    settled: assertion.settled,
    resolution: assertion.settlementResolution,
    expirationTime: Number(assertion.expirationTime),
    disputed: assertion.disputer !== ethers.ZeroAddress,
  };
}

/**
 * Settle a UMA assertion after the dispute window expires.
 * Returns the final resolution boolean (true = assertion upheld = verdict stands).
 *
 * @param {string} assertionId
 * @returns {boolean} resolution
 */
async function settleResolution(assertionId) {
  const wallet = getAdminWallet();
  const oo = getOOContract(wallet);

  const tx = await oo.settleAssertion(assertionId);
  await tx.wait();

  // Re-fetch to get final resolution
  const provider = getProvider();
  const ooRead = new ethers.Contract(process.env.UMA_OO_V3_ADDRESS, OO_V3_ABI, provider);
  const assertion = await ooRead.getAssertion(assertionId);

  console.log(`UMA: Assertion ${assertionId} settled. Resolution: ${assertion.settlementResolution}`);
  return assertion.settlementResolution;
}

module.exports = { proposeResolution, checkAssertionStatus, settleResolution };
