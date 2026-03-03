/**
 * uma.service.js — Real UMA OptimisticOracleV3 (OOv3) on-chain interactions
 *
 * How OOv3 works:
 *   1. assertTruth()  — proposer locks a USDC bond and states "the outcome is X"
 *   2. 2-hour (configurable) liveness window opens
 *   3. Anyone can call disputeAssertion() to challenge — both bonds go to UMA voters
 *   4. After liveness expires unchallenged → settleAssertion() finalises the result
 *
 * Required env vars (add to consumer-1 .env):
 *   ARB_RPC_URL          RPC endpoint (Arbitrum One or Arbitrum Sepolia for testnet)
 *   EVM_PRIVATE_KEY      Wallet that signs & pays gas; must hold bond tokens + ETH
 *   UMA_OO_ADDRESS       OptimisticOracleV3 contract address
 *   UMA_BOND_CURRENCY    ERC-20 bond token address (TestnetERC20 on Sepolia, USDC on mainnet)
 *   UMA_BOND_AMOUNT      Bond amount in token base units (e.g. 100000000 = 100 USDC at 6 dec)
 *   UMA_LIVENESS_PERIOD  Challenge window in seconds (7200 = 2h; set 60 for fast testing)
 */

const { ethers } = require("ethers");

// ── Minimal ABIs — only the 4 functions we use ────────────────────────────────

const OOV3_ABI = [
  // assertTruth: submit a UTF-8 claim, lock bond, get assertionId back
  "function assertTruth(bytes claim, address asserter, address callbackRecipient, address escalationManager, uint64 liveness, address currency, uint256 bond, bytes32 identifier, bytes32 domainId) external returns (bytes32 assertionId)",

  // settleAssertion: finalise after liveness period passes without dispute
  "function settleAssertion(bytes32 assertionId) external",

  // assertions: read assertion state (settled flag, dispute time, disputer address)
  "function assertions(bytes32 assertionId) external view returns (tuple(bool settled, int256 settlementResolution, uint64 assertionTime, uint64 expirationTime, address asserter, address disputer, address callbackRecipient, address escalationManager, address currency, uint256 bond, bytes32 identifier, bytes32 domainId, bytes claim))",

  // Event emitted by assertTruth so we can extract assertionId from receipt
  "event AssertionMade(bytes32 indexed assertionId, bytes32 domainId, bytes claim, address indexed asserter, address callbackRecipient, address escalationManager, address indexed disputer, uint64 expirationTime, address currency, uint256 bond, bytes32 indexed identifier)",
];

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getSigner() {
  const rpcUrl = process.env.ARB_RPC_URL;
  const privateKey = process.env.EVM_PRIVATE_KEY;
  if (!rpcUrl || !privateKey) {
    throw new Error("ARB_RPC_URL and EVM_PRIVATE_KEY must be set in .env");
  }
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  return new ethers.Wallet(privateKey, provider);
}

function getOOv3(signerOrProvider) {
  const address = process.env.UMA_OO_ADDRESS;
  if (!address) throw new Error("UMA_OO_ADDRESS must be set in .env");
  return new ethers.Contract(address, OOV3_ABI, signerOrProvider);
}

function getBondToken(signerOrProvider) {
  const address = process.env.UMA_BOND_CURRENCY;
  if (!address) throw new Error("UMA_BOND_CURRENCY must be set in .env");
  return new ethers.Contract(address, ERC20_ABI, signerOrProvider);
}

// ── Exported functions ────────────────────────────────────────────────────────

/**
 * submitUMAAssertion
 *
 * Encodes the claim, approves bond spend, calls assertTruth() on OOv3,
 * parses the AssertionMade event from the receipt, and returns the
 * assertionId + tx hash + challenge period end timestamp.
 *
 * @param {string} marketId   MongoDB _id of the market (used in claim text)
 * @param {string} outcome    The proposed winning outcome string
 * @returns {{ assertionId: string, txHash: string, challengeEnd: Date }}
 */
async function submitUMAAssertion(marketId, outcome) {
  const signer = getSigner();
  const oov3 = getOOv3(signer);
  const bondToken = getBondToken(signer);

  const bondAmount = BigInt(process.env.UMA_BOND_AMOUNT || "100000000");
  const liveness = Number(process.env.UMA_LIVENESS_PERIOD || "7200");

  // 1. Approve OOv3 to spend bond tokens (idempotent — skip if already approved)
  const currentAllowance = await bondToken.allowance(signer.address, process.env.UMA_OO_ADDRESS);
  if (currentAllowance < bondAmount) {
    const approveTx = await bondToken.approve(process.env.UMA_OO_ADDRESS, bondAmount);
    await approveTx.wait();
    console.log(`[UMA] Bond approved: ${approveTx.hash}`);
  }

  // 2. Encode the claim as UTF-8 bytes
  //    Format: "Outcome of market <id> is: <outcome>"
  const claimText = `Outcome of market ${marketId} is: ${outcome}`;
  const claimBytes = ethers.toUtf8Bytes(claimText);

  // 3. Call assertTruth
  //    callbackRecipient = address(0) — we poll via cron instead of using callbacks
  //    escalationManager  = address(0) — use default UMA escalation
  //    identifier         = "ASSERT_TRUTH" encoded as bytes32
  //    domainId           = bytes32(0)
  const ZERO_ADDRESS = ethers.ZeroAddress;
  const ASSERT_TRUTH_IDENTIFIER = ethers.encodeBytes32String("ASSERT_TRUTH");
  const ZERO_BYTES32 = ethers.ZeroHash;

  const tx = await oov3.assertTruth(
    claimBytes,
    signer.address,       // asserter = our wallet
    ZERO_ADDRESS,         // callbackRecipient
    ZERO_ADDRESS,         // escalationManager
    liveness,
    process.env.UMA_BOND_CURRENCY,
    bondAmount,
    ASSERT_TRUTH_IDENTIFIER,
    ZERO_BYTES32,
  );

  const receipt = await tx.wait();
  console.log(`[UMA] assertTruth tx: ${receipt.hash}`);

  // 4. Parse AssertionMade event to get assertionId
  const iface = new ethers.Interface(OOV3_ABI);
  let assertionId = null;
  for (const log of receipt.logs) {
    try {
      const parsed = iface.parseLog(log);
      if (parsed && parsed.name === "AssertionMade") {
        assertionId = parsed.args.assertionId;
        break;
      }
    } catch {
      // not our event — skip
    }
  }

  if (!assertionId) {
    throw new Error("AssertionMade event not found in receipt — assertionId unknown");
  }

  const challengeEnd = new Date(Date.now() + liveness * 1000);

  return {
    assertionId,
    txHash: receipt.hash,
    challengeEnd,
  };
}

/**
 * settleUMAAssertion
 *
 * Calls settleAssertion() after the liveness period has elapsed.
 * No signing of a new assertion — just finalises the existing one.
 *
 * @param {string} assertionId  bytes32 hex string returned by submitUMAAssertion
 * @returns {{ txHash: string, settled: true }}
 */
async function settleUMAAssertion(assertionId) {
  const signer = getSigner();
  const oov3 = getOOv3(signer);

  const tx = await oov3.settleAssertion(assertionId);
  const receipt = await tx.wait();
  console.log(`[UMA] settleAssertion tx: ${receipt.hash} for ${assertionId}`);

  return { txHash: receipt.hash, settled: true };
}

/**
 * getAssertionStatus
 *
 * Read-only view of the on-chain assertion struct.
 * Useful for checking whether a dispute occurred before the cron settles.
 *
 * @param {string} assertionId
 * @returns {{ settled: boolean, disputeTime: number, disputer: string }}
 */
async function getAssertionStatus(assertionId) {
  const provider = new ethers.JsonRpcProvider(process.env.ARB_RPC_URL);
  const oov3 = getOOv3(provider);

  const a = await oov3.assertions(assertionId);

  return {
    settled: a.settled,
    disputeTime: Number(a.assertionTime),
    disputer: a.disputer,
  };
}

module.exports = { submitUMAAssertion, settleUMAAssertion, getAssertionStatus };
