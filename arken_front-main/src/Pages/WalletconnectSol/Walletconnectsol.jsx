import React, { useEffect, useRef, useState } from "react";
import nacl from "tweetnacl";
import bs58 from "bs58";
import toast from "react-hot-toast";
import apiService from "../../core/sevice/detail";
import { postMethod } from "../../core/sevice/common.api";
import { moderateScale } from "../../utils/Scale";


const decryptPayload = (data, nonce, sharedSecret) => {
  if (!sharedSecret) throw new Error("Missing shared secret");

  const decryptedData = nacl.box.open.after(
    bs58.decode(data),
    bs58.decode(nonce),
    sharedSecret
  );

  if (!decryptedData) throw new Error("Unable to decrypt data");
 const decoded = new TextDecoder().decode(decryptedData);
  return JSON.parse(decoded);
};

const WalletConnect = () => {
  const [address, setAddress] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const hasRun = useRef(false);

  const showSuccessToast = (msg) => toast.success(msg);
  const showErrorToast = (msg) => toast.error(msg);


useEffect(() => {
  if (hasRun.current) return;
  hasRun.current = true;

  const verifyWallet = async () => {
    try {
      const params = new URLSearchParams(window.location.search);

      const uniqueId = params.get("uuid");
      const nonce = params.get("nonce");
      const encryptedData = params.get("data");
      const phantomPubKey = params.get("solflare_encryption_public_key");
      const dk = params.get("dk");

      if (!uniqueId || !nonce || !encryptedData || !phantomPubKey || !dk) {
        throw new Error("Missing URL params");
      }
      const dappSecretKey = bs58.decode(dk);

      const sharedSecret = nacl.box.before(
        bs58.decode(phantomPubKey),
        dappSecretKey
      );

       const connectData = decryptPayload(
        encryptedData,
        nonce,
        sharedSecret
      );

      const walletAddress = connectData.public_key;

      if (!walletAddress) {
        throw new Error("Wallet address missing");
      }

      setAddress(walletAddress);
      await verifyId(uniqueId, walletAddress);

    } catch (err) {
      console.error("Wallet verification error:", err);
      setErrorMsg(err.message || "Wallet verification failed");
      showErrorToast("Wallet verification failed");
    }
  };

  verifyWallet();
}, []);

  const verifyId = async (uniqueId, walletAddress) => {
    const payload = {
      uniqueId,
      connectedwalletName: "Solflare",
      connectedwalletAddress: walletAddress,
      connectedwalletStatus: true,
    };

    const resp = await postMethod({
      apiUrl: apiService.verify_id,
      payload,
    });

    if (resp.success) {
      showSuccessToast("Wallet connected successfully");
      setTimeout(() => {
        window.location.href = import.meta.env.VITE_BOT_URL || "https://t.me/";
      }, 1500);
    } else {
      showErrorToast(resp.message || "Verification failed");
    }
  };

  const telegramUrl = import.meta.env.VITE_BOT_URL || "https://t.me/";

  if (errorMsg) {
    return (
      <div style={pageStyle.cmmn_bdy_mainwrp}>
        <div style={pageStyle.wallet_connected_wrp}>
          <div style={{ ...pageStyle.check_icon_wrp, backgroundColor: "rgba(255,80,80,0.2)" }}>✕</div>
          <h2 style={pageStyle.connected_title}>Connection Failed</h2>
          <p style={{ color: "#ff6b6b", marginBottom: "20px", fontSize: "14px" }}>{errorMsg}</p>
          <button
            style={pageStyle.disconnect_btn}
            onClick={() => (window.location.href = telegramUrl)}
          >
            Back to Telegram
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle.cmmn_bdy_mainwrp}>
      <div style={pageStyle.wallet_connected_wrp}>
        <div style={pageStyle.check_icon_wrp}>✓</div>

        <h2 style={pageStyle.connected_title}>Successfully Connected</h2>
        <p style={pageStyle.connected_url}>Solflare Wallet</p>

        {address && (
          <p style={pageStyle.wallet_address}>
            {address.slice(0, 4)}...{address.slice(-4)}
          </p>
        )}

        <p style={pageStyle.instruction_text}>
          Returning you to Telegram...
        </p>

        <button
          style={pageStyle.disconnect_btn}
          onClick={() => (window.location.href = telegramUrl)}
        >
          Open in Telegram
        </button>
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

export default WalletConnect;