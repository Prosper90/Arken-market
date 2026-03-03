import { useEffect, useState } from "react";
import { Connection } from "@solana/web3.js";
import nacl from "tweetnacl";
import bs58 from "bs58";
import apiService from "../../core/sevice/detail";
import { postMethod } from "../../core/sevice/common.api";
import { moderateScale } from "../../utils/Scale";
import { env } from "../../core/sevice/envconfig";

const SOLANA_RPC = env.wallet_endpoint;

const WalletSuccess = () => {
  const [status, setStatus] = useState("Processing...");
  const [signature, setSignature] = useState("");
  const [loader, setloader] = useState(true);

  useEffect(() => {
    handlePhantomResponse();
  }, []);

  const handlePhantomResponse = async () => {
    try {
      setloader(true);
      const params = new URLSearchParams(window.location.search);
      const nonce = params.get("nonce");
      const data = params.get("data");
      const uuid = params.get("uuid");
      // These are passed from the deposit deeplink redirect_link
      const currency = params.get("currency") || "USDC";
      const amount = params.get("amount") || "0";

      if (!nonce || !data) {
        throw new Error("Missing response from Phantom");
      }

      setStatus("Decrypting response...");

      const phantomSession = await getPhantomSession(uuid);
      if (!phantomSession) {
        throw new Error("Session not found");
      }

      const decrypted = nacl.box.open.after(
        bs58.decode(data),
        bs58.decode(nonce),
        phantomSession.sharedSecret,
      );

      if (!decrypted) {
        throw new Error("Failed to decrypt response from Phantom");
      }

      const response = JSON.parse(new TextDecoder().decode(decrypted));
      console.log("Phantom response:", response);

      const connection = new Connection(SOLANA_RPC);
      let txSignature;

      if (response.signature) {
        // signAndSendTransaction — Phantom already signed and sent the tx
        txSignature = response.signature;
        setSignature(txSignature);
        setStatus("Confirming transaction...");
        await connection.confirmTransaction(txSignature, "confirmed");
      } else if (response.transaction) {
        // signTransaction — we need to broadcast the signed tx ourselves
        setStatus("Sending transaction to Solana...");
        txSignature = await connection.sendRawTransaction(
          bs58.decode(response.transaction),
          { skipPreflight: false, preflightCommitment: "confirmed" },
        );
        setSignature(txSignature);
        setStatus("Confirming transaction...");
        const confirmation = await connection.confirmTransaction(txSignature, "confirmed");
        if (confirmation.value.err) {
          throw new Error(`Transaction failed: ${confirmation.value.err}`);
        }
      } else {
        throw new Error("Unexpected response format from Phantom");
      }

      // Fetch on-chain details to extract addresses and amounts
      const txDetails = await connection.getTransaction(txSignature, {
        maxSupportedTransactionVersion: 0,
        commitment: "confirmed",
      });

      let fromAddress = phantomSession.publicKey || "";
      let toAddress = "";
      let detectedAmount = parseFloat(amount);
      let detectedCurrency = currency;

      if (txDetails) {
        const tokenInfo = parseTokenTransfer(txDetails);
        fromAddress = txDetails.transaction.message.accountKeys[0].toBase58();
        toAddress = tokenInfo.toAddress || "";
        if (tokenInfo.amount > 0) {
          detectedAmount = tokenInfo.amount;
          detectedCurrency = tokenInfo.token || currency;
        }
      }

      setStatus("✅ Transaction successful!");
      await updateTransactionStatus(
        phantomSession.telegramid,
        fromAddress,
        toAddress,
        txSignature,
        detectedAmount,
        detectedCurrency,
      );
      setloader(false);
    } catch (error) {
      setloader(false);
      console.error("Error processing transaction:", error);
      setStatus(`❌ Error: ${error.message}`);
    }
  };

  const getPhantomSession = async (uuid) => {
    const resp = await postMethod({
      apiUrl: apiService.get_unique_id,
      payload: { uniqueId: uuid },
    });

    if (resp.success) {
      const parsed = JSON.parse(resp.data.jsonData);
      return {
        sharedSecret: bs58.decode(parsed.sharedSecret),
        nonce: bs58.decode(parsed.nonce),
        publicKey: parsed.publicKey || "",
        telegramid: resp.data.telegramId,
      };
    }
    return null;
  };

  const updateTransactionStatus = async (
    telegramId,
    fromAddress,
    toAddress,
    txHash,
    depositAmount,
    currencySymbol,
  ) => {
    const obj = {
      telegramId,
      walletAddress: fromAddress,
      depositAddress: toAddress || "Unknown",
      WaletName: "phantom",
      depositAmount,
      currencySymbol: currencySymbol || "USDC",
      txHash,
    };
    const resp = await postMethod({
      apiUrl: apiService.transferToken,
      payload: obj,
    });
    if (!resp.success) {
      console.error("Failed to record deposit:", resp.message);
    }
  };

  const parseTokenTransfer = (txDetails) => {
    const preTokenBalances = txDetails.meta.preTokenBalances || [];
    const postTokenBalances = txDetails.meta.postTokenBalances || [];

    let amount = 0;
    let toAddress = "";

    for (let i = 0; i < postTokenBalances.length; i++) {
      const post = postTokenBalances[i];
      const pre = preTokenBalances.find((p) => p.accountIndex === post.accountIndex);
      const preAmount = pre ? parseFloat(pre.uiTokenAmount.uiAmountString) : 0;
      const postAmount = parseFloat(post.uiTokenAmount.uiAmountString);
      if (postAmount > preAmount) {
        amount = postAmount - preAmount;
        toAddress = post.owner;
        break;
      }
    }

    // No SPL token change — check native SOL balance change
    if (amount === 0) {
      const accountKeys = txDetails.transaction.message.accountKeys;
      for (let i = 1; i < accountKeys.length; i++) {
        const pre = txDetails.meta.preBalances[i] || 0;
        const post = txDetails.meta.postBalances[i] || 0;
        if (post > pre) {
          return {
            token: "SOL",
            amount: (post - pre) / 1e9,
            toAddress: accountKeys[i].toBase58(),
          };
        }
      }
    }

    return { token: "USDC", amount, toAddress: toAddress || "Unknown" };
  };

  return (
    <div style={pageStyle.cmmn_bdy_mainwrp}>
      <div style={pageStyle.wallet_connected_wrp}>
        {!loader && (
          <>
            <div style={pageStyle.check_icon_wrp}>✓</div>
            <h2 style={pageStyle.connected_title}>Deposit Successful</h2>
          </>
        )}
        <p style={pageStyle.connected_url}>Phantom Wallet</p>

        {signature && (
          <p style={pageStyle.wallet_address}>
            {signature.slice(0, 8)}...{signature.slice(-8)}
          </p>
        )}

        <p style={pageStyle.instruction_text}>
          {loader ? status : "Return to Arken bot to start making predictions."}
        </p>

        {loader ? (
          <button style={pageStyle.disconnect_btn}>Processing...</button>
        ) : (
          <button
            style={pageStyle.disconnect_btn}
            onClick={() => (window.location.href = env.BOT_URL)}
          >
            Back to Arken Bot
          </button>
        )}
      </div>
    </div>
  );
};

const pageStyle = {
  cmmn_bdy_mainwrp: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#000",
    padding: `${moderateScale(20)}px`,
  },
  wallet_connected_wrp: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    maxWidth: `${moderateScale(400)}px`,
  },
  check_icon_wrp: {
    width: `${moderateScale(80)}px`,
    height: `${moderateScale(80)}px`,
    borderRadius: "50%",
    backgroundColor: "rgba(255,255,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: "32px",
    marginBottom: `${moderateScale(30)}px`,
  },
  connected_title: {
    fontSize: `${moderateScale(24)}px`,
    fontWeight: 600,
    color: "#fff",
  },
  connected_url: {
    fontSize: `${moderateScale(18)}px`,
    color: "#fff",
    marginBottom: `${moderateScale(20)}px`,
  },
  wallet_address: {
    fontFamily: "monospace",
    background: "rgba(255,255,255,0.15)",
    padding: "8px 16px",
    borderRadius: "20px",
    color: "#fff",
    marginBottom: `${moderateScale(20)}px`,
  },
  instruction_text: {
    color: "#fff",
    opacity: 0.9,
    marginBottom: `${moderateScale(30)}px`,
  },
  disconnect_btn: {
    background: "#fff",
    color: "#000",
    padding: "12px 40px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
  },
};

export default WalletSuccess;
