import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { env } from "../../core/sevice/envconfig";
import { postMethod } from "../../core/sevice/common.api";
import apiService from "../../core/sevice/detail";

// Build fallback RPC list: configured endpoint first, then public fallbacks.
// To switch networks (testnet ↔ mainnet), only change wallet_endpoint in envconfig.js.
function buildRpcList() {
  const primary = env.wallet_endpoint;
  const isTestnet = primary.includes("testnet");
  const fallback = isTestnet
    ? "https://api.testnet.solana.com"
    : "https://api.mainnet-beta.solana.com";
  return primary === fallback ? [primary] : [primary, fallback];
}

async function getBlockhashWithFallback() {
  const endpoints = buildRpcList();
  for (const url of endpoints) {
    try {
      const conn = new Connection(url, "confirmed");
      const result = await conn.getLatestBlockhash("confirmed");
      return { connection: conn, blockhash: result.blockhash, lastValidBlockHeight: result.lastValidBlockHeight };
    } catch (e) {
      console.warn(`RPC ${url} failed:`, e.message);
    }
  }
  throw new Error("RPC unavailable. Please try again in a moment.");
}

// Parse a solana: payment URL into its components.
// e.g. "solana:ADDRESS?amount=3&spl-token=MINT&reference=REF"
function parseSolanaUrl(url) {
  const withoutScheme = url.replace(/^solana:/, "");
  const qMark = withoutScheme.indexOf("?");
  const toAddress = qMark === -1 ? withoutScheme : withoutScheme.slice(0, qMark);
  const params = new URLSearchParams(qMark === -1 ? "" : withoutScheme.slice(qMark + 1));
  return {
    toAddress: toAddress.trim(),
    amount: parseFloat(params.get("amount") || "0"),
    splToken: params.get("spl-token") || null,
  };
}

// Notify the backend that a deposit was made.
// Throws on failure so confirmAndReturn can show an error instead of silently redirecting.
async function recordDeposit({ telegramId, fromAddress, toAddress, txHash, amount, splToken }) {
  if (!telegramId) throw new Error("Missing Telegram ID — cannot record deposit.");
  const resp = await postMethod({
    apiUrl: apiService.transferToken,
    payload: {
      telegramId,
      walletAddress: fromAddress,
      depositAddress: toAddress || "Unknown",
      WaletName: "phantom",
      depositAmount: amount,
      currencySymbol: splToken ? "USDC" : "SOL",
      txHash,
    },
  });
  // postMethod returns {status: false, message: "..."} on API/network errors — treat as throw
  if (resp?.status === false || resp?.success === false) {
    throw new Error(resp?.message || "Backend rejected the deposit record.");
  }
}

// Two-step wallet routing:
//
// Step 1 — page opens in Chrome/Safari (Telegram openLink always goes to browser):
//   Auto-redirect to phantom:// custom scheme → OS opens Phantom specifically.
//
// Step 2 — Phantom opens this page again inside its in-app browser (?inside=1):
//   For Phantom: use window.phantom.solana JS API — no solana: URI at all.
//   For Trust Wallet: show a tappable solana: link (Trust Wallet intercepts internally).
export default function PayRedirect() {
  const [searchParams] = useSearchParams();
  const solanPayUrl = searchParams.get("url") || "";
  const wallet = (searchParams.get("wallet") || "phantom").toLowerCase();
  const inside = searchParams.get("inside") === "1";
  // Context passed by Deposit.jsx so we can record the deposit without mini-app polling
  const telegramId = searchParams.get("tid") || "";
  const amount = parseFloat(searchParams.get("amount") || "0");
  const currency = searchParams.get("currency") || "SOL";

  useEffect(() => {
    if (inside || !solanPayUrl) return;

    const sep = window.location.href.includes("?") ? "&" : "?";
    const insideUrl = window.location.href + sep + "inside=1";

    if (wallet === "trust") {
      window.location.href = `trust://open_url?coin_id=501&url=${encodeURIComponent(insideUrl)}`;
    } else {
      window.location.href = `phantom://browse/${encodeURIComponent(insideUrl)}?ref=${encodeURIComponent(window.location.origin)}`;
    }
  }, []);

  const walletLabel = wallet === "trust" ? "Trust Wallet" : "Phantom";

  // ── Step 2: inside the wallet browser ──────────────────────────────────────
  if (inside) {
    if (wallet === "trust") {
      return (
        <div style={styles.page}>
          <p style={styles.title}>Tap to confirm payment</p>
          <p style={styles.sub}>
            You will see the amount and recipient before approving.
          </p>
          <a href={solanPayUrl} style={styles.btn}>
            Confirm Payment in Trust Wallet
          </a>
        </div>
      );
    }

    return (
      <PhantomPay
        solanPayUrl={solanPayUrl}
        telegramId={telegramId}
        fallbackAmount={amount}
        fallbackCurrency={currency}
      />
    );
  }

  // ── Step 1: Chrome/Safari — auto-redirecting, show fallback button ──────────
  const sep = window.location.href.includes("?") ? "&" : "?";
  const insideUrl = window.location.href + sep + "inside=1";
  const fallbackUrl =
    wallet === "trust"
      ? `trust://open_url?coin_id=501&url=${encodeURIComponent(insideUrl)}`
      : `phantom://browse/${encodeURIComponent(insideUrl)}?ref=${encodeURIComponent(window.location.origin)}`;

  return (
    <div style={styles.page}>
      <p style={styles.title}>Opening {walletLabel}...</p>
      <p style={styles.sub}>
        If {walletLabel} doesn&apos;t open automatically, tap below.
      </p>
      <a href={fallbackUrl} style={styles.btn}>
        Open in {walletLabel}
      </a>
    </div>
  );
}

// Phantom in-app browser: sign and send using window.phantom.solana JS API.
// After the tx is confirmed, records the deposit on the backend directly —
// no dependency on the mini-app polling staying alive.
function PhantomPay({ solanPayUrl, telegramId, fallbackAmount, fallbackCurrency }) {
  const [phase, setPhase] = useState("idle"); // idle | paying | sent | confirming | error
  const [txSig, setTxSig] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [pendingTx, setPendingTx] = useState(null); // stored after signature, used by button

  const pay = async () => {
    setPhase("paying");
    try {
      const { toAddress, amount: parsedAmount, splToken } = parseSolanaUrl(solanPayUrl);
      const amount = parsedAmount || fallbackAmount;

      const provider = window.phantom?.solana;
      if (!provider?.isPhantom) {
        throw new Error(
          "Phantom wallet not detected. Make sure you opened this in Phantom's browser.",
        );
      }

      const connectResp = await provider.connect();
      const fromPubkey = connectResp.publicKey;

      const { connection, blockhash, lastValidBlockHeight } =
        await getBlockhashWithFallback();

      const tx = new Transaction({
        recentBlockhash: blockhash,
        feePayer: fromPubkey,
      });

      if (splToken) {
        const mint = new PublicKey(splToken);
        const toPubkey = new PublicKey(toAddress);
        const fromATA = await getAssociatedTokenAddress(mint, fromPubkey);
        const toATA = await getAssociatedTokenAddress(mint, toPubkey);
        tx.add(
          createTransferInstruction(
            fromATA,
            toATA,
            fromPubkey,
            Math.round(amount * 1_000_000), // USDC 6 decimals
            [],
            TOKEN_PROGRAM_ID,
          ),
        );
      } else {
        tx.add(
          SystemProgram.transfer({
            fromPubkey,
            toPubkey: new PublicKey(toAddress),
            lamports: Math.round(amount * LAMPORTS_PER_SOL),
          }),
        );
      }

      // Phantom shows its native approval popup — Trust Wallet cannot intercept this.
      const { signature } = await provider.signAndSendTransaction(tx);

      // Tx is now broadcast to the network. Store everything needed for the
      // confirm step, which runs when the user taps "Return to Telegram".
      setTxSig(signature);
      setPendingTx({
        signature,
        connection,
        fromAddress: fromPubkey.toBase58(),
        toAddress,
        amount,
        splToken,
      });
      setPhase("sent");
    } catch (err) {
      console.error("Payment error:", err);
      setErrMsg(err.message || "Payment failed. Please try again.");
      setPhase("error");
    }
  };

  // Called when user taps "Return to Telegram" on the sent screen.
  // Confirms on-chain, records in backend, then navigates to the mini-app.
  const confirmAndReturn = async () => {
    if (!pendingTx) return;
    setPhase("confirming");
    try {
      const { signature, connection, fromAddress, toAddress, amount, splToken } = pendingTx;

      // Poll for on-chain confirmation (string form — no blockhash expiry risk).
      const status = await connection.confirmTransaction(signature, "confirmed");
      if (status.value?.err) {
        throw new Error("Transaction was rejected on-chain. Please contact admin.");
      }

      // Record deposit and credit balance in the backend.
      await recordDeposit({ telegramId, fromAddress, toAddress, txHash: signature, amount, splToken });

      // Callback is done — open Telegram normally. User taps "Open Trading App" inside.
      window.location.href = env.BOT_URL;
    } catch (err) {
      console.error("Confirm error:", err);
      setErrMsg(
        err.message ||
        `Confirmation failed. Contact admin with your transaction ID: ${txSig}`,
      );
      setPhase("error");
    }
  };

  // Deep link that opens the Arken mini-app and navigates directly to the Wallet page.
  // TelegramRedirect.js handles startapp=wallet → navigate('/Wallet').
  const miniAppUrl = `${env.BOT_URL}?startapp=wallet`;

  // "sent" → tx is on the network, waiting for user to trigger confirmation
  // "confirming" → user tapped button, verifying on-chain + calling backend
  if (phase === "sent" || phase === "confirming") {
    const isConfirming = phase === "confirming";
    return (
      <div style={styles.page}>
        <p style={{ ...styles.title, color: "#4ade80" }}>✓ Transaction Sent!</p>
        <p style={{
          color: "#fbbf24",
          fontSize: "13px",
          fontWeight: 700,
          textAlign: "center",
          maxWidth: "280px",
          margin: 0,
        }}>
          ⚠️ Do NOT close this page until your deposit is confirmed.
        </p>
        {txSig && (
          <p style={{ ...styles.sub, fontFamily: "monospace", fontSize: "11px" }}>
            Tx: {txSig.slice(0, 8)}...{txSig.slice(-8)}
          </p>
        )}
        {isConfirming && (
          <p style={styles.sub}>Verifying on-chain and updating your balance…</p>
        )}
        <button
          onClick={confirmAndReturn}
          disabled={isConfirming}
          style={{
            ...styles.btn,
            opacity: isConfirming ? 0.6 : 1,
            cursor: isConfirming ? "not-allowed" : "pointer",
          }}
        >
          {isConfirming ? "Confirming…" : "Return to Telegram"}
        </button>
      </div>
    );
  }

  const isPaying = phase === "paying";

  return (
    <div style={styles.page}>
      <p style={styles.title}>
        {isPaying ? "Processing..." : "Tap to confirm payment"}
      </p>
      {!isPaying && (
        <p style={styles.sub}>
          Phantom will show you the amount and recipient before you approve.
        </p>
      )}
      {phase === "error" && (
        <p style={{ color: "#f87171", fontSize: "13px", textAlign: "center", maxWidth: "280px" }}>
          {errMsg}
        </p>
      )}
      <button
        onClick={pay}
        disabled={isPaying}
        style={{
          ...styles.btn,
          opacity: isPaying ? 0.6 : 1,
          cursor: isPaying ? "not-allowed" : "pointer",
        }}
      >
        {isPaying ? "Processing..." : "Confirm Payment in Phantom"}
      </button>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#000",
    gap: "16px",
    fontFamily: "sans-serif",
    padding: "32px",
    boxSizing: "border-box",
  },
  title: {
    color: "#fff",
    fontSize: "20px",
    fontWeight: 700,
    margin: 0,
    textAlign: "center",
  },
  sub: {
    color: "rgba(255,255,255,0.6)",
    fontSize: "14px",
    margin: 0,
    textAlign: "center",
    maxWidth: "280px",
  },
  btn: {
    marginTop: "8px",
    background: "#fff",
    color: "#000",
    padding: "16px 44px",
    borderRadius: "12px",
    fontWeight: 700,
    fontSize: "16px",
    textDecoration: "none",
    display: "inline-block",
    border: "none",
    cursor: "pointer",
  },
};
