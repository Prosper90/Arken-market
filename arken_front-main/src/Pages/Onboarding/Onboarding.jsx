import React, { useEffect, useRef } from "react";
import useState from "react-usestateref";
import "./onboarding.css";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";

import { moderateScale } from "../../utils/Scale";
import ImageComponent from "../../Components/ImageComponent";
import { useNavigate } from "react-router-dom";
import obrd_middl_wllImg1 from "../../assets/image/obrd_middl_wllImg1.webp";
import { useTelegramUser } from "../../context/TelegramUserContext";
import { useSearchParams } from "react-router-dom";
import Solflare from "@solflare-wallet/sdk";
import { v4 as uuidv4 } from "uuid";
import bs58 from "bs58";
import apiService from "../../core/sevice/detail";
import nacl from "tweetnacl";
// import SignClient from "@walletconnect/sign-client";
import { postMethod, getMethod } from "../../core/sevice/common.api";
import EthereumProvider from "@walletconnect/ethereum-provider";
import obrd_middl_wllImg2 from "../../assets/image/obrd_middl_wllImg2.webp";
import obrd_middl_wllImg3 from "../../assets/image/obrd_middl_wllImg3.webp";
import obrd_middl_wllImg4 from "../../assets/image/obrd_middl_wllImg4.webp";
import obrd_middl_tpImg2 from "../../assets/image/obrd_middl_tpImg2.webp";
import obrd_middl_tpImg1 from "../../assets/image/obrd_middl_tpImg1.webp";
import obrd_middl_tpImg3 from "../../assets/image/obrd_middl_tpImg3.webp";
import phantom from "../../assets/image/phantom.webp";
import walletIMG from "../../assets/image/wllt_img.webp";
import solsfare from "../../assets/image/solsfare.webp";
import mdi_stars_icon from "../../assets/image/mdi_stars_icon.webp";
import onbrd_stp3_img2 from "../../assets/image/onbrd_stp3_img2.webp";
import onbrd_stp3_img3 from "../../assets/image/onbrd_stp3_img3.webp";
import onbrd_stp3_img1 from "../../assets/image/onbrd_stp3_img1.webp";
import { createAppKitWalletButton } from "@reown/appkit-wallet-button";
// import { useAccount, useBalance, useDisconnect } from "wagmi";
import { MdOutlineArrowBackIosNew } from "react-icons/md";
import { RiShieldCheckFill } from "react-icons/ri";
import * as web3 from "@solana/web3.js";
import { GoArrowRight } from "react-icons/go";

import toast from "react-hot-toast";
import Select from "react-select";
import { ethers } from "ethers";
import { BrowserProvider, JsonRpcProvider, Contract, parseUnits } from "ethers";
import GetDappKeyPair from "../success/phantomKeypair";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
// import WalletConnectProvider from "@walletconnect/ethereum-provider";
import { FaCopy, FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa6";
import { env } from "../../core/sevice/envconfig";
import * as token from "@solana/spl-token";
// import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { useAccount, useBalance, useConnect, useDisconnect } from "wagmi";
// import { wagmiConfig } from '../../web3Modal.js'
import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  clusterApiUrl,
  Transaction,
} from "@solana/web3.js";
// import {connectMetaMask} from "./wallet"
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddressSync,
  createTransferCheckedInstruction,
} from "@solana/spl-token";
// import {connectEthereum} from "./wallet"
import {
  getOrCreateAssociatedTokenAccount,
  transfer,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
// import { useWallet, useConnection } from "@solana/wallet-adapter-react";

import { useSendTransaction } from "wagmi";
import { parseEther } from "viem";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
// import { useTelegramUser } from "../../context/TelegramUserContext";
// import { getAccount, getBalance } from "@wagmi/core";
import { LuInfo } from "react-icons/lu";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

window.Telegram?.WebApp?.ready();
// const SOLANA_RPC = "https://api.mainnet.solana.com";
const SOLANA_RPC =
  "https://mainnet.helius-rpc.com/?api-key=05031ac5-0873-42a5-bb11-1c124bb119b0";
const RPC_URL = "https://rpc.sepolia.org";
const CHAIN_ID = 11155111;
// import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
const options = [
  { value: "ARB", label: "ARB" },
  { value: "SOL", label: "SOL" },
];
const customStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: "#0c0c0c",
    borderColor: "#a1a1a2",
    boxShadow: "none",
    minHeight: "40px",
    borderRadius: "5px",
    color: "#fff",
    "&:hover": {
      borderColor: "#3114a6",
    },
  }),

  singleValue: (base) => ({
    ...base,
    color: "#fff",
    fontSize: "14px",
  }),

  placeholder: (base) => ({
    ...base,
    color: "#8a8a8a",
  }),

  dropdownIndicator: (base) => ({
    ...base,
    color: "#aaa",
    "&:hover": {
      color: "#3114a6",
    },
  }),

  indicatorSeparator: () => ({
    display: "none",
  }),

  menu: (base) => ({
    ...base,
    backgroundColor: "#0c0c0c",
    borderRadius: "10px",
    border: "1px solid ##a1a1a2",
    marginTop: "5px",
    zIndex: 10,
  }),

  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "#3114a6" : "#0c0c0c",
    color: "#fff",
    cursor: "pointer",
    fontSize: "14px",
  }),
};

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  boxShadow: 24,
};

const Onboarding = () => {
  const generateUniqueId = () => uuidv4();
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { sendTransactionAsync: sendEvmTx } = useSendTransaction();
  const generateId = Math.random().toString(36).substring(2, 10);
  const { disconnect } = useDisconnect();
  const { data: balances } = useBalance({ address });
  const [balance, setBalance] = useState(null);
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);
  const [toastId, setToastId] = useState(null);
  const [walletLoading, setwalletLoading] = useState(null);
  const [loadstatus, setloadstatus] = useState(false);
  const [userWallet, setUserWallet] = useState({
    isConnected: false,
    walletAddress: "",
    walletName: "",
    uniqueId: "",
  });
  const [searchParams] = useSearchParams();
  const telegraminitData = searchParams.get("telegramId");
  const [walletaccess, setWalletaccess] = useState(false);
  const [appKitWalletButton, setAppKitWalletButton] = useState(null);
  const [selectedCurrency, setselectedCurrency] = useState(null);
  const [
    selectedCurrencySymbol,
    setselectedCurrencySymbol,
    selectedCurrencySymbolref,
  ] = useState(null);
  const params = new URLSearchParams(window.location.search);
  const publicKeynew = params.get("public_key");
  const sessionnew = params.get("session");
  const telegramUsertelegramId = localStorage.getItem("telegramUsertelegramId");
  const [validate, setvalidate] = useState(null);
  const wcClientRef = useRef(null);
  const [session, setSession] = useState(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [dappKeyPair] = useState(nacl.box.keyPair());
  const [isConnecting, setIsConnecting] = useState(false);
  const [DepositLimit, setDepositLimit] = useState(null);
  const [validationmsg, setvalidationmsg] = useState("");
  const [validationCurrencymsg, setvalidationCurrencymsg] = useState("");
  const [depositAmount, setdepositAmount, depositAmountref] = useState(0);
  const { select, publicKey, connected, wallets } = useWallet();
  // const { address, isConnected } = useAccount();
  const [onboardStep, setOnboardStep] = useState(1);
  const [Address, setAddress] = useState(localStorage.getItem("walletAddress"));
  const [privateKey, setprivateKey] = useState();
  const { telegramUser } = useTelegramUser();
  const [depositAddress, SetDepositAddress] = useState();
  const [walletName, setwalletName] = useState(
    localStorage.getItem("walletName"),
  );
  const { connection } = useConnection();
  function normalizeWalletName(name = "") {
    return name
      .toLowerCase()
      .replace(/['"]/g, "") // remove quotes
      .trim();
  }

  useEffect(() => {
    getAddress();
  }, [0]);

  sessionStorage.setItem("dappSecretKey", bs58.encode(dappKeyPair.secretKey));

  sessionStorage.setItem("dappPublicKey", bs58.encode(dappKeyPair.publicKey));

  const [addrssLoader, setAddrssLoader] = useState(true);
  // useEffect(()=>{
  //   alert(window.Telegram?.WebAppinitDataUnsafe)
  //   if(window.Telegram?.WebApp?.initDataUnsafe?.startapp == "phantom"){
  //    alert("phantom connected ")
  //   }
  // })

  const [walletDetails, setwalletDetails] = useState({});
  const getAddress = async () => {
    try {
      setAddrssLoader(true);
      const obj = {
        wallet_name: localStorage.getItem("walletName"),
        telegramId: telegramUser?.telegramId,
        // telegramId: telegramUser?.telegramId || "5100502824",
      };
      var data = {
        apiUrl: apiService.getAddress,
        payload: obj,
      };
      var resp = await postMethod(data);
      setAddrssLoader(false);
      let selectedWallet;
      if (resp.success) {
        // showSuccessToast(resp.message);
        if (walletName == "metamask") {
          selectedWallet = resp.WalletData.find(
            (w) => w.currencySymbol === "ARB",
          );
        } else {
          selectedWallet = resp.WalletData.find(
            (w) => w.currencySymbol === "SOL",
          );
        }
        console.log(selectedWallet);
        SetDepositAddress(selectedWallet.address);
        // alert(selectedWallet.address)
        // alert(walletName)
        // setArbBalance(selectedWallet.amount)
      } else {
        // showErrorToast("failed ");
      }
    } catch (err) {
      console.error(err);
      // alert(err?.shortMessage || err.message);
    }
  };
  // const { disconnect } = useDisconnect();
  const showSuccessToast = (message) => {
    if (toastId) {
      toast.dismiss(toastId);
    }
    const newToastId = toast.success(message);
    setToastId(newToastId);
  };
  // const { open } = useModal();
  // const { isConnecte, user,isPhantomInstalled  } = usePhantom();
  const showErrorToast = (message) => {
    if (toastId) {
      toast.dismiss(toastId);
    }
    const newToastId = toast.error(message);
    setToastId(newToastId);
  };

  const buildUrl = (path, params) =>
    `https://phantom.app/ul/v1/${path}?${params.toString()}`;

  const buildUrlsol = (path, params) =>
    `https://solflare.com/ul/v1/${path}?${params.toString()}`;

  if (publicKeynew) {
    console.log("Wallet connected:", publicKeynew);

    localStorage.setItem("phantom_public_key", publicKeynew);
    localStorage.setItem("phantom_session", sessionnew);
  }
  // const onConnectRedirectLink = `${window.location.origin}/onBoarding`;

  const onConnectRedirectLink = `${window.location.origin}/onBoarding`;
  const redirect = `${env.BOT_URL}?startapp=phantom`;

  const pagedirect = `${env.frontUrl}wallet-details/${generateId}`;

  const saveUniqId = async (uniqueId) => {
    const telegramIdVef =
      telegramUser?.telegramId ||
      telegramUsertelegramId ||
      localStorage.getItem("telegramId");
    if (!telegramIdVef) {
      throw new Error("Telegram session not found. Please restart the app.");
    }
    var obj = {
      telegramId: telegramIdVef,
      uniqueId: uniqueId,
      isConnected: false,
    };
    var data = {
      apiUrl: apiService.save_unique_id,
      payload: obj,
    };
    var resp = await postMethod(data);
    if (!resp.success) {
      throw new Error(resp.message || "Failed to initialize wallet session");
    }
  };
  useEffect(() => {
    if (!telegramUser?.telegramId) return;

    getUserDetails();

    const intervalId = setInterval(() => {
      getUserDetails();
    }, 5000);

    return () => clearInterval(intervalId);
    // }, []);
  }, [telegramUser?.telegramId]);

  const [phantomSession, setPhantomSession] = useState();
  console.log(phantomSession, "phantomSession");
  const getUserDetails = async () => {
    try {
      if (!telegramUser?.telegramId) return;
      const resp = await postMethod({
        apiUrl: apiService.getUserDetails,
        payload: { telegramId: telegramUser?.telegramId },
        // payload: { telegramId: telegramUser?.telegramId||"5100502824"},
      });
      if (resp.success && resp.data) {
        setUserWallet({
          isConnected: resp.data.wallet?.isConnected || false,
          walletAddress: resp.data.wallet?.walletAddress || "",
          walletName: resp.data.wallet?.walletName || "",
          uniqueId: resp.data.uniqueId || "",
        });
        if (
          resp.data.wallet?.isConnected == true &&
          resp.data.wallet?.walletName == "Phantom"
        ) {
          localStorage.setItem("walletName", "phantom");
          setwalletName("phantom");
          localStorage.setItem("walletAddress", resp.data.wallet?.walletAddress);
          setAddress(resp.data.wallet?.walletAddress);
        }

        // Phantom session (optional — only set when user has connected Phantom)
        try {
          if (resp?.data?.jsonData) {
            const parsed = JSON.parse(resp.data.jsonData);
            setPhantomSession({
              ...parsed,
              sharedSecret: bs58.decode(parsed.sharedSecret),
              nonce: bs58.decode(parsed.nonce),
            });
          }
        } catch (e) { /* jsonData not set for this user yet */ }

        // ── Auto-wallet logic ──────────────────────────────────────────────
        if (
          Array.isArray(resp.data.custodialWallets) &&
          resp.data.custodialWallets.length > 0
        ) {
          const wallets = resp.data.custodialWallets;
          setCustodialWallets(wallets);

          // Auto-reconnect if not already connected
          const alreadySet =
            localStorage.getItem("walletName") === "newwallet" &&
            localStorage.getItem("walletAddress");
          if (!alreadySet) {
            reconnectCustodialWallet(wallets);
          }
        } else if (!walletCreationAttempted.current) {
          // New user — auto-create both ARB + SOL wallets on first load
          walletCreationAttempted.current = true;
          createNewWalletFunc();
        }
        // ──────────────────────────────────────────────────────────────────
      } else {
        console.error(resp.message || "Failed to fetch user details");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  // const saveUniqId = async () => {
  //   const id = Number(5100502824);
  //   var obj = {
  //     telegramId: Number(localStorage.getItem("telegramId")) || id,
  //     UniqId: generateId,
  //   };
  //   var data = {
  //     apiUrl: apiService.save_unique_id,
  //     payload: obj,
  //   };
  //   var resp = await postMethod(data);
  //   if (resp.success) {
  //     console.log(resp.message);
  //     // navigate(pagedirect);
  //   } else {
  //     showErrorToast("Transaction failed, please try again");
  //   }
  // };
  const connectPhantomnew = async () => {
    try {
      const uniqueId = generateUniqueId();

      await saveUniqId(uniqueId);

      const dk = bs58.encode(dappKeyPair.secretKey);
      const pagedirect = `${import.meta.env.VITE_FRONT_URL || "http://localhost:3000/"}wallet-details?uuid=${uniqueId}&dk=${dk}`;

      setwalletName("phantom");
      localStorage.setItem("walletName", "phantom");
      const params = new URLSearchParams({
        dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
        cluster: "mainnet-beta",
        app_url: "https://phantom.app",
        redirect_link: pagedirect,
      });

      const url = buildUrl("connect", params);

      window.Telegram?.WebApp
        ? window.Telegram.WebApp.openLink(url)
        : (window.location.href = url);
    } catch (err) {
      console.error("Phantom connect error:", err);
      showErrorToast(err.message || "Failed to connect wallet");
    }
  };

  const sendusdcfn = async () => {
    if (
      !phantomSession ||
      !phantomSession.session ||
      !phantomSession.sharedSecret
    ) {
      showErrorToast(
        "Phantom session not found. Please reconnect your wallet.",
      );
      setdepositLoader(false);
      return;
    }
    try {
      await sendUSDC({
        fromPublicKey: userWallet.walletAddress,
        // toAddress: "8EbhZoXacbGZxqfAhRSJf5RkA8DAjVwD9CT2z2XpEn6",
        toAddress: depositAddress,
        amount: depositAmountref.current,
        phantomSession,
        d_key_secret: sessionStorage.getItem("dappSecretKey"),
        d_key_public: sessionStorage.getItem("dappPublicKey"),
        // dappKeyPair
      });
    } catch (error) {
      console.log(error);
      // alert(error);
    }
  };

  async function sendUSDC({
    fromPublicKey,
    toAddress,
    amount,
    phantomSession,
    d_key_secret,
    d_key_public,
  }) {
    try {
      const USDC_MINT = new PublicKey(
        "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      );
      const connection = new Connection(SOLANA_RPC);

      const from = new PublicKey(fromPublicKey);
      const to = new PublicKey(toAddress);
      setdepositLoader(true);
      // Get ATAs
      const fromATA = await getAssociatedTokenAddress(USDC_MINT, from);
      const toTokenAccount = await getAssociatedTokenAddress(
        USDC_MINT,
        to,
        true,
      );
      const fromATAInfo = await connection.getAccountInfo(fromATA);
      if (!fromATAInfo) {
        showErrorToast("No USDC found in your wallet. Add USDC first.");
        setdepositLoader(false);
        return;
      }
      const balanceInfo = await connection.getTokenAccountBalance(fromATA);

      const usdcBalance = balanceInfo.value.uiAmount; // already divided by 1e6
      console.log("USDC Balance:", usdcBalance);
      //  if(usdcBalance<env.MINIMUM_MAITANNACE_SOL){
      //     showErrorToast(`Need to maintain your balance for ${env.MINIMUM_MAITANNACE_SOL} SOl`)
      //     setdepositLoader(false);
      //     return
      //   }
      const ix = [];
      // Check if receiver's ATA exists
      const info = await connection.getAccountInfo(toTokenAccount);
      if (!info) {
        ix.push(
          createAssociatedTokenAccountInstruction(
            from,
            toTokenAccount,
            to,
            USDC_MINT,
          ),
        );
      }
      // Add transfer instruction
      ix.push(
        createTransferInstruction(
          fromATA,
          toTokenAccount,
          from,
          Number(amount) * 1_000_000,
        ),
      );

      // Create transaction
      const tx = new Transaction().add(...ix);
      tx.feePayer = from;

      const { blockhash } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;

      // ✅ NEW: Use signTransaction instead of signAndSendTransaction
      // Serialize the transaction (base58 encoded)
      const serializedTx = tx.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      });

      // Create a NEW nonce for this request
      const nonce = nacl.randomBytes(24);

      // Prepare the payload (must include session token)
      const payload = {
        transaction: bs58.encode(serializedTx),
        session: phantomSession.session, // ✅ Critical: include session from connect
      };

      // Encrypt the payload
      const encrypted = nacl.box.after(
        new TextEncoder().encode(JSON.stringify(payload)),
        nonce,
        phantomSession.sharedSecret,
      );

      // Redirect URL
      const redirectUrl = `${env.frontUrl}wallet-success?uuid=${userWallet.uniqueId}`;

      // Build Phantom signTransaction deep link
      // dappPublicKey is persisted in the backend session so it survives mini-app restarts
      const dappPubKey =
        phantomSession.dappPublicKey ||
        d_key_public ||
        sessionStorage.getItem("dappPublicKey");
      const params = new URLSearchParams({
        dapp_encryption_public_key: dappPubKey,
        nonce: bs58.encode(nonce),
        redirect_link: redirectUrl,
        payload: bs58.encode(encrypted),
      });

      // ✅ Use signTransaction endpoint (not signAndSendTransaction)
      const url = `https://phantom.app/ul/v1/signTransaction?${params.toString()}`;
      setdepositLoader(false);
      console.log("🔗 Opening Phantom URL");

      // Open in Telegram or browser
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.openLink(url, {
          try_instant_view: false,
        });
      } else {
        window.location.href = url;
      }
      getTransaction();
    } catch (error) {
      console.error("❌ Error sending USDC:", error);
      setdepositLoader(false);
      showErrorToast(error.message || "Transaction failed");
    }
  }

  // ✅ IMPORTANT: Handle the redirect response
  // Add this to your wallet-success page to get the signed transaction
  async function handlePhantomRedirect() {
    try {
      const params = new URLSearchParams(window.location.search);
      const nonce = params.get("nonce");
      const data = params.get("data");

      if (!nonce || !data) {
        throw new Error("Missing response parameters");
      }

      // Decrypt the response
      const decrypted = nacl.box.open.after(
        bs58.decode(data),
        bs58.decode(nonce),
        phantomSession.sharedSecret,
      );

      if (!decrypted) {
        throw new Error("Failed to decrypt response");
      }

      const response = JSON.parse(new TextDecoder().decode(decrypted));
      const signedTransaction = response.transaction; // base58 encoded signed tx

      // ✅ Now YOU send it to the network
      const connection = new Connection(SOLANA_RPC);
      const signature = await connection.sendRawTransaction(
        bs58.decode(signedTransaction),
      );

      console.log("Transaction sent:", signature);
      await connection.confirmTransaction(signature);

      alert(`Transaction successful! Signature: ${signature}`);
    } catch (error) {
      console.error("Error handling redirect:", error);
      alert(`Error: ${error.message}`);
    }
  }

  // const sendusdcfn = async () => {
  //   try {
  //     await sendUSDC({
  //       fromPublicKey: userWallet.walletAddress,
  //       toAddress: "8EbhZoXacbGZxqfAhRSJf5RkA8DAjVwD9CT2z2XpEn6",
  //       amount: depositAmountref.current,
  //       phantomSession
  //     });
  //   } catch (error) {
  //     console.log(error);
  //     alert(error);
  //   }
  // };

  // async function sendUSDC({ fromPublicKey, toAddress, amount, phantomSession }) {
  //   try {
  //     const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
  //     const connection = new Connection(SOLANA_RPC);

  //     const from = new PublicKey(fromPublicKey);
  //     const to = new PublicKey(toAddress);

  //     // Get ATAs
  //     const fromATA = await getAssociatedTokenAddress(USDC_MINT, from);
  //     const toTokenAccount = await getAssociatedTokenAddress(USDC_MINT, to, true);

  //     const ix = [];

  //     // Check if receiver's ATA exists
  //     const info = await connection.getAccountInfo(toTokenAccount);
  //     if (!info) {
  //       ix.push(
  //         createAssociatedTokenAccountInstruction(
  //           from,
  //           toTokenAccount,
  //           to,
  //           USDC_MINT
  //         )
  //       );
  //     }

  //     // Add transfer instruction
  //     ix.push(
  //       createTransferInstruction(
  //         fromATA,
  //         toTokenAccount,
  //         from,
  //         Number(amount) * 1_000_000
  //       )
  //     );

  //     // Create transaction
  //     const tx = new Transaction().add(...ix);
  //     tx.feePayer = from;

  //     const { blockhash } = await connection.getLatestBlockhash();
  //     tx.recentBlockhash = blockhash;

  //     // ====== DEBUGGING OUTPUT - CHECK THESE VALUES ======
  //     console.log("🔍 DEBUGGING INFO:");

  //     // 1. Check session validity
  //     alert("📱 Phantom Session:", {
  //       hasNonce: !!phantomSession?.nonce,
  //       nonceLength: phantomSession?.nonce?.length,
  //       hasSharedSecret: !!phantomSession?.sharedSecret,
  //       sharedSecretLength: phantomSession?.sharedSecret?.length
  //     });

  //     // 2. Check dapp keys
  //     alert("🔑 Dapp Keys:", {
  //       hasDappKeys: typeof dappKeyPairs !== 'undefined',
  //       hasPublicKey: !!dappKeyPairs?.publicKey,
  //       publicKeyEncoded: dappKeyPairs?.publicKey ? bs58.encode(dappKeyPairs.publicKey) : 'MISSING'
  //     });

  //     // 3. Check wallet balances
  //     const solBalance = await connection.getBalance(from);
  //     console.log("💰 Wallet Balance:", {
  //       solBalance: solBalance / 1e9,
  //       hasSufficientSOL: solBalance > 5000 // Need SOL for fees
  //     });

  //     // 4. Check USDC account
  //     const fromATAInfo = await connection.getAccountInfo(fromATA);
  //     console.log("🪙 USDC Account:", {
  //       fromATAExists: !!fromATAInfo,
  //       fromATA: fromATA.toString()
  //     });

  //     // 5. Check transaction
  //     console.log("📝 Transaction:", {
  //       instructionCount: tx.instructions.length,
  //       feePayer: tx.feePayer.toString(),
  //       hasBlockhash: !!tx.recentBlockhash
  //     });

  //     // ====== END DEBUGGING ======

  //     // Serialize transaction
  //     const serializedTx = tx.serialize({
  //       requireAllSignatures: false,
  //       verifySignatures: false
  //     });

  //     console.log("📦 Serialized TX length:", serializedTx.length);

  //     // Encrypt for Phantom
  //     const encrypted = nacl.box.after(
  //       serializedTx,
  //       phantomSession.nonce,
  //       phantomSession.sharedSecret
  //     );

  //     console.log("🔒 Encrypted payload length:", encrypted.length);

  //     // Redirect URL
  //     const redirectUrl = `${env.frontUrl}wallet-success?uuid=${userWallet.uniqueId}`;

  //     // Build Phantom deep link
  //     const params = new URLSearchParams({
  //       dapp_encryption_public_key: bs58.encode(dappKeyPairs.publicKey),
  //       nonce: bs58.encode(phantomSession.nonce),
  //       redirect_link: encodeURIComponent(redirectUrl),
  //       payload: bs58.encode(encrypted)
  //     });

  //     const url = `https://phantom.app/ul/v1/signAndSendTransaction?${params.toString()}`;

  //     console.log("🔗 Opening Phantom URL (length):", url.length);
  //     console.log("🔗 Full URL:", url);

  //     // Open in Telegram or browser
  //     if (window.Telegram?.WebApp) {
  //       window.Telegram.WebApp.openLink(url, {
  //         try_instant_view: false
  //       });
  //     } else {
  //       window.location.href = url;
  //     }

  //   } catch (error) {
  //     console.error("❌ Error sending USDC:", error);
  //     alert(`Error: ${error.message}`);
  //     throw error;
  //   }
  // }

  // const sendusdcfn = async ()=>{
  //   try{
  //     await sendUSDC({
  //   fromPublicKey: userWallet.walletAddress,
  //   // toAddress: depositAddress,
  //   toAddress: "8EbhZoXacbGZxqfAhRSJf5RkA8DAjVwD9CT2z2XpEn6",
  //   amount: depositAmountref.current, // 5 USDC
  //   phantomSession
  // });
  //   }catch(error){
  //     console.log(error)
  //   alert(error)
  //   }
  // }

  // async function sendUSDC({
  //   fromPublicKey,
  //   toAddress,
  //   amount,
  //   phantomSession
  // }) {
  //   try {
  //     console.log(userWallet)
  //     console.log(  fromPublicKey,"fromPublicKey",
  //   toAddress,"toAddress",
  //   amount,"amount",
  //   phantomSession,"---------------")
  //   alert("call usdc")
  //   const USDC_MINT = new PublicKey(
  //   "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
  // );
  //   // const connection = new Connection(SOLANA_RPC);

  // const connection = new Connection(SOLANA_RPC);

  // const from = new PublicKey(fromPublicKey);
  // const to = new PublicKey(toAddress);

  // // sender ATA
  // const fromATA = await getAssociatedTokenAddress(
  //   USDC_MINT,
  //   from
  // );
  // const toTokenAccount = await getAssociatedTokenAddress(USDC_MINT, to,true);
  // const ix = [];
  // const info = await connection.getAccountInfo(toTokenAccount);
  // if (!info) {
  //   // ATA does not exist → create it
  //   ix.push(
  //     createAssociatedTokenAccountInstruction(
  //       from, // ✅ Phantom pays
  //       toTokenAccount,
  //       to,
  //       USDC_MINT
  //     )
  //   );
  // }
  // ix.push(
  //   createTransferInstruction(
  //     fromATA,
  //     toTokenAccount,
  //     from,
  //     Number(depositAmountref.current) * 1_000_000
  //   )
  // );

  // // tx
  // const tx = new Transaction().add(...ix);
  // tx.feePayer = from;

  // const { blockhash } = await connection.getLatestBlockhash();
  // tx.recentBlockhash = blockhash;

  // // serialize
  // const serializedTx = tx.serialize({
  //   requireAllSignatures: false,
  //   verifySignatures: false
  // });
  // // const serializedTx = tx.serialize({
  // //   requireAllSignatures: false
  // // });
  // const message = Uint8Array.from(serializedTx);

  // // encrypt for Phantom
  // const encrypted = nacl.box.after(
  //   message,
  //   phantomSession.nonce,
  //   phantomSession.sharedSecret
  // );

  // // redirect
  // const redirectUrl =
  //   `${env.frontUrl}wallet-success?uuid=${userWallet.uniqueId}`;

  // const params = new URLSearchParams({
  //   dapp_encryption_public_key: bs58.encode(dappKeyPairs.publicKey),
  //   nonce: bs58.encode(phantomSession.nonce),
  //   redirect_link: redirectUrl,
  //   payload: bs58.encode(encrypted)
  // });

  // const url =
  //   "https://phantom.app/ul/v1/signAndSendTransaction?" +
  //   params.toString();

  // // telegram open
  // if (window.Telegram?.WebApp) {
  //   window.Telegram.WebApp.openLink(url, {
  //     try_instant_view: false
  //   });
  // } else {
  //   window.location.href = url;
  // }
  // //   const from = new PublicKey(fromPublicKey);
  // //   const to = new PublicKey(toAddress);

  // //   const fromATA = await getAssociatedTokenAddress(
  // //     new PublicKey(USDC_MINT),
  // //     from
  // //   );

  // //   const toATA = await getAssociatedTokenAddress(
  // //     new PublicKey(USDC_MINT),
  // //     to,
  // //     // true
  // //   );

  // //   const ix = [];

  // //   const info = await connection.getAccountInfo(toATA);
  // //   if (!info) {
  // //     ix.push(
  // //       createAssociatedTokenAccountInstruction(
  // //         from,
  // //         toATA,
  // //         to,
  // //         new PublicKey(USDC_MINT)
  // //       )
  // //     );
  // //   }
  // //  console.log("-------------------")
  // //   ix.push(
  // //     createTransferInstruction(
  // //       fromATA,
  // //       toATA,
  // //       from,
  // //       depositAmountref.current * 1_000_000
  // //     )
  // //   );
  // //  console.log("=====222")

  // //   const tx = new Transaction().add(...ix);
  // //   tx.feePayer = from;
  // //  console.log("=-------=-=")

  // //   const { blockhash } = await connection.getLatestBlockhash();
  // //   tx.recentBlockhash = blockhash;
  // // //  console.log("]]]]]]]]")
  // // // console.log(`dappKeyPairs:${dappKeyPairs}`)
  // // // console.log(`phantomSession:${phantomSession}`)
  // // const serializedTx = tx.serialize({
  // //   requireAllSignatures: false,
  // // });

  // // // encrypt bytes
  // // const encrypted = nacl.box.after(
  // //   serializedTx,
  // //   phantomSession.nonce,
  // //   phantomSession.sharedSecret
  // // );
  // //     const pagedirect_sing = `${env.frontUrl}wallet-success?uuid=${userWallet.uniqueId}`;
  // // const params = new URLSearchParams({
  // //   dapp_encryption_public_key: bs58.encode(dappKeyPairs.publicKey),
  // //   nonce: bs58.encode(phantomSession.nonce),
  // //   redirect_link:encodeURIComponent(pagedirect_sing),
  // //   payload: bs58.encode(encrypted)
  // // });
  // // alert(params,"dfdsfsd");
  // //   const url =
  // //     "https://phantom.app/ul/v1/signAndSendTransaction?" +
  // //     params.toString();
  // //   if (window.Telegram?.WebApp) {
  // //   window.Telegram.WebApp.openLink(url, {
  // //     try_instant_view: false,
  // //   });
  // // } else {
  // //   window.location.href = url;
  // // }
  //   } catch (error) {
  //     console.log(error,"---");
  //     alert(error);
  //   }
  // }

  const redirectsol = `${env.BOT_URL}?startapp=solflare`;
  const connectSolflaremnew = () => {
    const params = new URLSearchParams({
      dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
      // cluster: "mainnet-beta",
      cluster: "devnet",
      app_url: "https://solflare.com",
      redirect_link: onConnectRedirectLink,
    });

    const url = buildUrlsol("connect", params);

    window.Telegram?.WebApp
      ? window.Telegram.WebApp.openLink(url)
      : (window.location.href = url);
  };

  const WC_PROJECT_ID = env.metamakskProjectId;

  // Arbitrum USDC
  const USDC_ARB = env.USDC_ARB;

  // Receiver wallet (admin)
  // const ADMIN_WALLET = env.Admin_wallet_ARB;

  const ERC20_ABI = [
    "function decimals() view returns (uint8)",
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
  ];

  let wcProvider;
  let ethersProvider;
  let signer;

  const connectWalletMetamask = async () => {
    try {
      setwalletName("metamask");
      localStorage.setItem("walletName", "metamask");
      if (!wcProvider) {
        wcProvider = await EthereumProvider.init({
          projectId: WC_PROJECT_ID,
          chains: [42161], // Arbitrum
          // optionalChains: [], // allow ETH → ARB
          showQrModal: true,
        });
      }

      // 🔑 Connect wallet (Telegram required)
      const accounts = await wcProvider.enable();
      if (!accounts || !accounts.length) {
        // alert("Wallet not connected");
        throw new Error("No accounts");
      }

      const provider = new ethers.BrowserProvider(wcProvider);
      const net = await provider.getNetwork();
      if (net.chainId !== 42161n) {
        try {
          await provider.send("wallet_switchEthereumChain", [
            { chainId: "0xa4b1" }, // 42161
          ]);
        } catch (err) {
          // alert("Please switch to Arbitrum network");
          throw err;
        }
      }

      // ✅ NOW create signer
      const signer = await provider.getSigner(accounts[0]);

      // 🔍 Validate signer
      const address = await signer.getAddress();
      setAddress(address);
      // alert(address,"address");
      localStorage.setItem("walletAddress", address);
      localStorage.setItem("walletName", "metamask");
      return signer;
    } catch (error) {
      // alert(error);
    }
  };
  const [tsdetails, settsdetails] = useState("");
  const handleEvmTransfer = async () => {
    try {
      if (!depositAmountref.current) {
        // alert("Enter amount");
        return;
      }
      +setdepositLoader(true);
      const signer = await connectWalletMetamask();
      const network = await signer.provider.getNetwork();
      // alert(network.chainId);
      if (network.chainId !== 42161n) {
        await signer.provider.send("wallet_switchEthereumChain", [
          { chainId: "0xa4b1" }, // 42161
        ]);
        // alert("Please switch to Arbitrum network");
        setLoading(false);
        return;
      }
      const usdc = new Contract(USDC_ARB, ERC20_ABI, signer);
      const balance = await usdc.balanceOf(walletAddress);
      // if(balance<env.MINIMUM_MAITANNACE_ARB){
      //   showErrorToast(`Need to maintain your balance for ${env.MINIMUM_MAITANNACE_ARB} ARB`)
      //   setdepositLoader(false);
      //   return
      // }
      const value = parseUnits(depositAmountref.current.toString(), 6);
      const tx = await usdc.transfer(depositAddress, value);
      // alert(`tx:${tx}`);
      settsdetails(tx.hash);
      const receipt = await tx.wait();

      if (tx) {
        const obj = {
          telegramId:
            teleId ||
            localStorage.getItem("telegramId") ||
            window.Telegram?.WebApp?.initDataUnsafe?.user?.id,
          walletAddress: localStorage.getItem("walletAddress") || Address,
          depositAddress: depositAddress,
          WaletName: "metamask",
          depositAmount: depositAmountref.current,
          currency: selectedCurrency,
          txHash: tx.hash,
        };
        // alert(obj);
        var data = {
          apiUrl: apiService.transferToken,
          payload: obj,
        };
        var resp = await postMethod(data);
        setdepositLoader(false);

        if (resp.success) {
          showSuccessToast(resp.message);
          navigate("/markets");
        } else {
          showErrorToast("Transaction failed, please try again");
        }
        setdepositLoader(false);
      } else {
        showErrorToast("Transaction failed, please try again");
      }
    } catch (err) {
      console.error(err);
      alert(err);
      setdepositLoader(false);
    }
  };

  // const ERC20_ABI = [ "function decimals() view returns (uint8)", "function balanceOf(address account) view returns (uint256)", "function transfer(address to, uint256 amount) returns (bool)" ];
  // let wcProvider;

  //  const initWalletConnect = async () => {
  //   if (wcProvider) return wcProvider; // reuse

  //   wcProvider = await EthereumProvider.init({
  //     projectId: env.metamakskProjectId,
  //     chains: [42161], // Arbitrum
  //     showQrModal: true,
  //   });

  //   await wcProvider.connect();
  //   return wcProvider;
  // };
  // async function handleEvmTransfer() {
  //   try {
  //     if (!depositAmountref.current) {
  //       setvalidationmsg("Enter Amount");
  //       return;
  //     }

  //     setdepositLoader(true);

  //     // ✅ WALLETCONNECT PROVIDER
  //     const wc = await initWalletConnect();

  //     const provider = new BrowserProvider(wc);
  //     const signer = await provider.getSigner();

  //     const usdc = new Contract(env.USDC_ARB, ERC20_ABI, signer);
  //     const amount = parseUnits(depositAmountref.current, 6);

  //     const tx = await usdc.transfer(
  //       env.Admin_wallet_ARB,
  //       amount
  //     );

  //     console.log("TX:", tx.hash);
  //     await tx.wait();

  //     setdepositLoader(false);
  //   } catch (err) {
  //     console.error(err);
  //     alert(err);
  //     setdepositLoader(false);
  //   }
  // }

  //ARB TRANSFER
  // const handleEvmTransfer = async () => {
  //   try {
  //      if (!selectedCurrency) {
  //       setvalidate(true);
  //       setvalidationCurrencymsg("Choose currency");
  //       return;
  //     }

  //     if (!depositAmountref.current) {
  //       setvalidate(true);
  //       setvalidationmsg("Enter Amount");
  //       return;
  //     }

  //     setdepositLoader(true);
  //     const tx = await sendEvmTx({
  //       to: env.Admin_wallet_ARB,
  //       value: parseEther(depositAmountref.current),
  //       chainId: 42161, // Force Arbitrum
  //     });
  //     // alert(`Success: ${tx}`);
  //     if(tx){
  //     const obj = {
  //       telegramId:
  //         teleId ||
  //         localStorage.getItem("telegramId") ||
  //         window.Telegram?.WebApp?.initData,
  //       walletAddress: address,
  //       WaletName: "metamask",
  //       depositAmount: depositAmountref.current,
  //       currency: selectedCurrency,
  //       txHash: tx,
  //     };
  //     var data = {
  //       apiUrl: apiService.transferToken,
  //       payload: obj,
  //     };
  //     var resp = await postMethod(data);
  //     setdepositLoader(false);

  //     if (resp.success) {
  //       showSuccessToast(resp.message);
  //         navigate("/markets");
  //     } else {
  //       showErrorToast("Transaction failed, please try again");
  //     }
  //   }else{
  //       showErrorToast("Transaction failed, please try again");
  //     setdepositLoader(false);

  //   }
  //   } catch (e) {
  //     console.log(e)
  //       showErrorToast("Transaction failed, please try again",e);
  //     setdepositLoader(false);
  //     // alert("Check if wallet is on Arbitrum");
  //    }
  // };

  const handleSolTransfer = async () => {
    try {
      // 1. Manually trigger selection if not connected
      if (!connected) {
        const metamaskWallet = wallets.find(
          (w) => w.adapter.name === "MetaMask",
        );
        if (metamaskWallet) {
          await select(metamaskWallet.adapter.name);
          return; // Wait for connection to complete
        }
      }

      // if (!publicKey) return alert("Please connect MetaMask first!");

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: address,
          toPubkey: new PublicKey(
            "Ki2pMf2VZSnmFLcXVLykGfbUwfhyHKeymf2xvnH1aN5",
          ),
          lamports: 0.001 * LAMPORTS_PER_SOL,
        }),
      );

      // Low latency settings
      const { blockhash } = await connection.getLatestBlockhash("processed");
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection, {
        skipPreflight: true, // Speeds up the transaction popup
      });

      // alert(`Success! Signature: ${signature}`);
    } catch (err) {
      console.error("Transfer Error:", err);
      // alert(err);
    }
  };

  // --- SOLANA (SPL-USDT) TRANSFER ---
  const handleSplTransfer = async () => {
    try {
      const MINT = new PublicKey(
        "Es9vMFrzaCERmJfrkykTjQpXKitnW4ityNCmpCdPNVsJ",
      );
      const DEST = new PublicKey("Ki2pMf2VZSnmFLcXVLykGfbUwfhyHKeymf2xvnH1aN5");

      const fromATA = getAssociatedTokenAddressSync(MINT, publicKey);
      const toATA = getAssociatedTokenAddressSync(MINT, DEST);

      const tx = new Transaction().add(
        createTransferInstruction(fromATA, toATA, publicKey, 0.00001 * 10 ** 6),
      );

      const { blockhash } = await connection.getLatestBlockhash("finalized");
      tx.recentBlockhash = blockhash;

      const sig = await sendTransaction(tx, connection);
      // alert(`USDT Sent: ${sig}`);
    } catch (e) {
      // alert("Check if recipient has a USDT account");
    }
  };

  const handleonboardStep = (step) => {
    checkTelegramId();
    getBalance();
    if (step === 2) {
      // If user has already seen the fund popup, go straight to markets
      if (localStorage.getItem("hasSeenFundPopup") === "true") {
        navigate("/markets");
        return;
      }
      // First time — mark it so next visit skips it
      localStorage.setItem("hasSeenFundPopup", "true");
    }
    if (onboardStep < 3) {
      setOnboardStep(step);
    }

    // const getAddress = localStorage.getItem("walletAddress");
    // if (wallet?.address || (getAddress && walletaccess)) {
    //   if (onboardStep < 3) {
    //     setOnboardStep(step);
    //   }
    // } else {
    //   showErrorToast("Please connect your wallet");
    // }
  };
  const handleStepReduce = () => {
    if (onboardStep == 1) {
      navigate("/");
    } else if (onboardStep > 1) {
      setOnboardStep(onboardStep - 1);
    }
  };

  useEffect(() => {
    const storedWallet = JSON.parse(localStorage.getItem("walletDetails"));
    if (storedWallet) setWallet(storedWallet);
  }, []);

  const signSolanaWallet = async (telegramId) => {
    try {
      const provider = window.solflare || window.solana;

      if (!provider) {
        throw new Error("No Solana wallet found");
      }

      if (!provider.signMessage) {
        throw new Error("Wallet does not support signMessage");
      }

      await provider.connect();

      const message = `Link wallet to Telegram ID: ${telegramId}`;
      const encodedMessage = new TextEncoder().encode(message);

      const signed = await provider.signMessage(encodedMessage);

      return {
        chain: "SOLANA",
        address: provider.publicKey.toBase58(),
        message,
        signature: bs58.encode(signed.signature),
      };
    } catch (err) {
      console.error("Solana sign error:", err);
      throw err;
    }
  };

  const [ethData, setEthData] = useState(null);
  const [telegramId, setTelegramId] = useState(null);

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  }

  useEffect(() => {
    const tgId = getCookie("telegramId");
    if (tgId) {
      console.log("Telegram ID from cookie:", tgId);
      setTelegramId(tgId);
    } else {
    }
  }, []);

  const onConnect = () => {
    // Find the WalletConnect connector
    const connector = connectors.find((c) => c.id === "walletConnect");
    connect({ connector });
  };
  // const connectETH = async () => {
  //   console.log("=====")
  //     const data = await connectEthereum();
  //     setEthData(data);
  //   };
  useEffect(() => {
    getCurrenyList();
  }, [0]);

  //    useEffect(async () => {
  //   await  initWalletConnect();
  //   }, []);

  //   const initWalletConnect = async () => {
  //     if (!wcClientRef.current) {
  //       try {
  //         wcClientRef.current = await SignClient.init({
  //           projectId: "287d42b489fce2f51cd3f5a9cfb6b549",
  //           metadata: {
  //             name: "Arken Telegram Wallet",
  //             description: "Connect your wallet to Arken",
  //             url: "https://arken.blfdemo.online",
  //             icons: ["https://res.cloudinary.com/dqtdd1frp/image/upload/v1766562117/Arken_kbciym.png"],
  //           },
  //         });

  //         console.log("✅ WalletConnect initialized");
  //         setupEventListeners();
  //         restoreSessions();
  //       } catch (error) {
  //         console.error("❌ WalletConnect init error:", error);
  //       }
  //     }
  //   };

  //   const setupEventListeners = () => {
  //     const wcClient = wcClientRef.current;
  //     if (!wcClient) return;

  //     wcClient.on("session_event", (event) => {
  //       console.log("📨 Session event:", event);
  //     });

  //     wcClient.on("session_update", ({ topic, params }) => {
  //       console.log("📨 Session update:", topic, params);
  //       const _session = wcClient.session.get(topic);
  //       const updatedSession = { ..._session, namespaces: params.namespaces };
  //       setSession(updatedSession);
  //     });

  //     wcClient.on("session_delete", () => {
  //       console.log("📨 Session deleted");
  //       setSession(null);
  //       setWalletAddress("");
  //     });
  //   };

  //    const restoreSessions = () => {
  //     const wcClient = wcClientRef.current;
  //     if (!wcClient) return;

  //     const sessions = wcClient.session.getAll();
  //     if (sessions.length > 0) {
  //       const lastSession = sessions[sessions.length - 1];
  //       setSession(lastSession);

  //       const accounts = lastSession.namespaces.solana?.accounts || [];
  //       if (accounts.length > 0) {
  //         const address = accounts[0].split(":")[2];
  //         setWalletAddress(address);
  //       }

  //       console.log("✅ Session restored:", lastSession);
  //     }
  //   };

  //   const tgAlert = (message) => {
  //   const tg = window.Telegram?.WebApp;
  //   if (!tg) return;

  //   if (parseFloat(tg.version) >= 6.1) {
  //     tg.showAlert(message);
  //   } else {
  //     console.log("[TG ALERT]", message);
  //   }
  // };

  //  const connectWalletnew = async () => {
  //     if (isConnecting) {
  //       console.log("⚠️ Already connecting...");
  //       return;
  //     }

  //     try {
  //       setIsConnecting(true);
  //       await initWalletConnect();

  //       const wcClient = wcClientRef.current;
  //       if (!wcClient) {
  //         console.error("❌ WalletConnect not initialized");
  //         tgAlert("Failed to initialize WalletConnect");
  //         setIsConnecting(false);
  //         return;
  //       }

  //       console.log("🔄 Creating connection...");

  //       const { uri, approval } = await wcClient.connect({
  //         optionalNamespaces: {
  //           solana: {
  //             methods: [
  //               "solana_signMessage",
  //               "solana_signTransaction",
  //               "solana_signAndSendTransaction"
  //             ],
  //              chains: ["solana:devnet"],
  //             // chains: ["solana:4sGjMW1sUnHzSxGspuhpqLDx6wiyjNtZ"], // Devnet
  //             // For mainnet: ["solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp"]
  //             events: ["accountsChanged"],
  //           },
  //         },
  //         pairingTopic: undefined,
  //       });

  //       if (!uri) {
  //         console.error("❌ URI missing");
  //         tgAlert("Failed to generate connection URI");
  //         setIsConnecting(false);
  //         return;
  //       }

  //       console.log("✅ URI generated:", uri);

  //       const deepLink = `https://phantom.app/ul/wc?uri=${encodeURIComponent(uri)}`;
  //       console.log("🔗 Opening Phantom...");

  //       if (window.Telegram?.WebApp) {
  //         window.Telegram.WebApp.openLink(deepLink);
  //       } else {
  //         window.location.href = deepLink;
  //       }

  //       tgAlert("Opening Phantom wallet... Please approve the connection.");

  //       console.log("⏳ Waiting for approval (5 min timeout)...");

  //       const approvalTimeout = new Promise((_, reject) => {
  //         setTimeout(() => reject(new Error("Connection timeout - please try again")), 300000); // 5 minutes
  //       });

  //       const sessionData = await Promise.race([
  //         approval(),
  //         approvalTimeout
  //       ]);

  //       console.log("✅ Session approved:", sessionData);
  //       setSession(sessionData);

  //       const accounts = sessionData.namespaces.solana?.accounts || [];
  //       if (accounts.length > 0) {
  //         const address = accounts[0].split(":")[2];
  //         setWalletAddress(address);
  //         console.log("✅ Connected wallet:", address);

  //         tgAlert("✅ Wallet connected successfully!");

  //         // await linkWalletToBackend(address);
  //       }

  //     } catch (error) {
  //       console.error("❌ Connection error:", error);

  //       if (error.message.includes("expired") || error.message.includes("timeout")) {
  //         tgAlert("⚠️ Connection timed out. Please try again and approve faster in Phantom.");
  //       } else if (error.message.includes("rejected")) {
  //         tgAlert("❌ Connection rejected by user.");
  //       } else {
  //         tgAlert("❌ Failed to connect. Please try again.");
  //       }
  //     } finally {
  //       setIsConnecting(false);
  //     }
  //   };

  //   const connectWalletnew = async () => {
  //   await initWalletConnect();

  //   const wcClient = wcClientRef.current;
  //   if (!wcClient) {
  //     console.error("WalletConnect not initialized");
  //     return;
  //   }

  //   const { uri } = await wcClient.connect({
  //     requiredNamespaces: {
  //       solana: {
  //         methods: ["solana_signMessage"
  //           , "solana_signTransaction"],
  //         chains: ["solana:4sGjMW1sUnHzSxGspuhpqLDx6wiyjNtZ"],
  //         events: [],
  //       },
  //     },
  //   });

  //   if (!uri) {
  //     console.error("WalletConnect URI missing");
  //     return;
  //   }

  //  const deepLink = `https://phantom.app/ul/wc?uri=${encodeURIComponent(uri)}`;

  // Telegram.WebApp.openLink(deepLink);

  // };

  //fix here
  const [currencyList, setCurrencyList] = useState([
    { value: "sol", label: "SOL", key: "sol", depositLimit: 0 },
    { value: "usdc", label: "USDC", key: "usdc", depositLimit: 0 },
    { value: "token", label: "TOKEN", key: "token", depositLimit: 0 },
  ]);
  const [chainCHoose, setchainCHoose] = useState([]);
  const getCurrenyList = async () => {
    try {
      var data = {
        apiUrl: apiService.getCurrenyList,
      };
      var resp = await getMethod(data);
      if (resp) {
        var datas = [];

        for (let i = 0; i < resp.data.length; i++) {
          const opt = resp.data[i];

          // TOKEN is a Solana SPL token — skip for EVM wallets
          if (
            walletName === "metamask" &&
            ["USDT", "SOL", "TOKEN"].includes(opt.currencySymbol)
          ) {
            continue;
          }

          if (walletName === "solflare" && opt.currencySymbol === "ARB") {
            continue;
          }

          datas.push({
            value: opt._id,
            label: opt.currencySymbol,
            key: opt._id,
            depositLimit: opt.minDepositLimit,
          });
        }

        //       for (let i = 0; i < resp.data.length; i++) {
        //         const opt = resp.data[i];
        //         console.log(opt.currencySymbol,"opt.currencySymbol")
        //       if (walletName != "metamask" && opt.currencySymbol === "ARB") {
        //   continue; // skip this item
        // }
        //         const obj = {
        //           value: opt._id,
        //           label: opt.currencySymbol,
        //           key: opt._id,
        //           depositLimt: opt.minDepositLimit,
        //         };

        //         datas.push(obj);
        //       }
        if (datas.length > 0) setCurrencyList(datas);
        // else: keep initial fallback [SOL, USDC, TOKEN]

        // setCurrencyList(resp.data);
      }
      // else: keep initial fallback [SOL, USDC, TOKEN]
    } catch (error) {
      console.error("Solana sign error:", error);
      throw error;
    }
  };
  const signPhantomWallet = async (telegramId) => {
    try {
      const provider = window.solana;

      if (!provider || !provider.isPhantom) {
        throw new Error("Phantom wallet not found");
      }

      if (!provider.signMessage) {
        throw new Error("Phantom does not support signMessage");
      }

      await provider.connect();

      const message = `Link wallet to Telegram ID: ${telegramId}`;
      const encodedMessage = new TextEncoder().encode(message);

      const signed = await provider.signMessage(encodedMessage);

      return {
        chain: "SOLANA",
        address: provider.publicKey.toBase58(),
        message,
        signature: bs58.encode(signed.signature),
      };
    } catch (error) {
      console.error("Phantom sign error:", error);
      throw error;
    }
  };

  // const handlePhantomConnect = async (key) => {
  //   try {
  //     // console.log(isPhantomInstalled,"isPhantomInstalledisPhantomInstalled")
  //     //   if (isPhantomInstalled) {
  //     console.log(window.phantom?.solana?.isPhantom, "[----");
  //     // open(); // opens Phantom connect
  //     // }
  //     // open()
  //     return;
  //     await connectPhantom(key);
  //     setWalletaccess(true);

  //     const signedWallet = await signPhantomWallet(telegramUser.telegramId);

  //     const resp = await postMethod({
  //       apiUrl: apiService.verifyWallet,
  //       payload: {
  //         telegramId: telegramUser.telegramId,
  //         ...signedWallet,
  //       },
  //     });

  //     if (resp.success) {
  //       setWalletaccess(true);
  //       console.log("Phantom wallet linked");
  //     } else {
  //       // alert(resp.message);
  //     }
  //   } catch (error) {
  //     setdepositLoader(false);
  //     console.error("Phantom flow failed:", error);
  //   }
  // };

  const handlePhantomConnect = async () => {
    await connectPhantomnew();
    // const origin = window.location.origin;
    // const appUrl = origin;
    // const redirectLink = `${origin}/onBoarding`;

    // const phantomUrl =
    //   `https://phantom.app/ul/v1/connect` +
    //   `?app_url=${encodeURIComponent(appUrl)}` +
    //   `&redirect_link=${encodeURIComponent(redirectLink)}`;

    // if (window.Telegram?.WebApp) {
    //   window.Telegram.WebApp.openLink(phantomUrl, {
    //     try_instant_view: false,
    //   });
    // } else {
    //   window.location.href = phantomUrl;
    // }
  };

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const originalOpen = window.open;
      window.open = (url, target, features) => {
        if (!url) return originalOpen(url, target, features);

        let finalUrl = url;

        // FIX FOR SOLFLARE/PHANTOM
        if (url.includes("solflare") || url.includes("phantom")) {
          // Force the URL into a Universal Link format
          finalUrl = `https://solflare.com/ul/v1/browse?url=${encodeURIComponent(
            window.location.href,
          )}&ref=${encodeURIComponent(window.location.origin)}`;
        }

        // FIX FOR METAMASK
        if (url.includes("metamask://")) {
          finalUrl = url.replace("metamask://", "https://metamask.app.link/");
        }

        // Tell Telegram to open this link in the external browser/app
        window.Telegram.WebApp.openLink(finalUrl);
        return null;
      };
    }
  }, []);
  const [teleId, setTeleId] = useState("");
  const [intiData, setintiData] = useState("");

  const checkTelegramId = async () => {
    try {
      var obj = {
        address:
          telegramUser?.telegramId ||
          window.Telegram?.WebApp?.initDataUnsafe?.user?.id ||
          Address,
      };
      const resp = await postMethod({
        apiUrl: apiService.checkTelegramId,
        payload: obj,
      });
      console.log(resp, "resp");
      setTeleId(resp.data);
      setintiData(resp.initData);
      localStorage.setItem("intData", resp.initData);
      await authenticateTelegramUser(resp.initData);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    checkTelegramId();
  }, []);
  useEffect(() => {
    if (!telegraminitData) return;

    authenticateTelegramUser(telegraminitData);
  }, [telegraminitData]);

  const { setTelegramUser } = useTelegramUser();

  const authenticateTelegramUser = async (data) => {
    try {
      // setLoadingAuth(true);

      // if (!window.Telegram || !window.Telegram.WebApp) {
      //   console.warn("Not opened inside Telegram WebApp");
      //   setLoadingAuth(false);
      //   return;
      // }

      // const tg = window.Telegram.WebApp;
      // tg.ready();

      const initData = data;

      const resp = await postMethod({
        apiUrl: apiService.telegramWebappAuth,
        payload: { initData },
      });

      if (resp.success) {
        setTelegramUser(resp.data);
        localStorage.setItem("telegramUser", JSON.stringify(resp.data));
        console.log("Telegram user authenticated:", resp.data);
      } else {
        console.error(resp.message);
      }
    } catch (error) {
      console.error("Telegram auth error:", error);
    } finally {
    }
  };
  const [loadingwallet, setloadingwallet] = useState(false);
  const handleSolflareConnect = async (key) => {
    try {
      // await connectSolflare(key);
      console.log(key, "--");
      localStorage.setItem("walletName", key);
      setwalletName(key);
      await select("Solflare");
      // await saveInit();
      setloadingwallet(true);
      const address = publicKey ? publicKey.toBase58() : null;
      // localStorage.setItem("walletAddress", address);
      setWalletaccess(true);
      setAddress(address);
      setWalletaccess(true);
      setloadingwallet(false);
      checkTelegramId();
      const signedWallet = await signSolanaWallet(telegramUser?.telegramId);
      localStorage.setItem("telegramId", telegramUser.telegramId);
      const resp = await postMethod({
        apiUrl: apiService.verifyWallet,
        payload: {
          telegramId: telegramUser.telegramId || "",
          // telegramId: "",
          ...signedWallet,
        },
      });
      setloadingwallet(false);
      if (resp.success) {
        setWalletaccess(true);
        console.log("Wallet linked successfully");
      } else {
        setWalletaccess(false);
        setAddress("");
        toast.error(resp.message);
      }
    } catch (error) {
      console.log(
        isConnected || (Address && walletaccess),
        isConnected,
        Address,
        walletaccess,
      );
      setWalletaccess(false);
      setAddress("");
      // alert(error)
      console.error("Solflare connect flow failed:", error);
    }
  };

  const disconnectWallet = async () => {
    try {
      if (
        userWallet.walletName &&
        (userWallet.walletName.toLowerCase() === "phantom" ||
          userWallet.walletName.toLowerCase() === "solflare")
      ) {
        try {
          await postMethod({
            apiUrl: apiService.disconnect_wallet,
            payload: { uniqueId: userWallet.uniqueId },
          });
          console.log(
            "Disconnect API called for wallet:",
            userWallet.walletName,
          );
          getUserDetails();
        } catch (apiErr) {
          console.error("Disconnect API failed:", apiErr);
        }
      }

      await disconnect();

      Object.keys(localStorage)
        .filter((key) => key.startsWith("@appkit/"))
        .forEach((key) => localStorage.removeItem(key));

      const keysToRemove = [
        "walletconnect",
        "wc@2:client",
        "wagmi.recentConnectorId",
        "wagmi.connected",
        "WALLETCONNECT_DEEPLINK_CHOICE",
      ];

      localStorage.clear();
      localStorage.setItem("walletAddress", "");
      localStorage.setItem("walletName", "");
      setAddress("");
      setWalletaccess(false);

      keysToRemove.forEach((key) => localStorage.removeItem(key));
      localStorage.removeItem("walletDetails");
      setWallet(null);

      console.log("Wallet fully disconnected + state cleared.");
    } catch (err) {
      console.error("Disconnect error:", err);
    }
  };
  // const disconnectWallet = async () => {
  //   // await disconnect();
  //   // console.log("=-==")
  //   // localStorage.clear()
  //   // window.location.reload();
  //   // disconnects();
  //   try {
  //     await disconnect();
  //     Object.keys(localStorage)
  //       .filter((key) => key.startsWith("@appkit/"))
  //       .forEach((key) => localStorage.removeItem(key));
  //     const keysToRemove = [
  //       "walletconnect",
  //       "wc@2:client",
  //       "wagmi.recentConnectorId",
  //       "wagmi.connected",
  //       "WALLETCONNECT_DEEPLINK_CHOICE",
  //     ];
  //     localStorage.clear();
  //     localStorage.setItem("walletAddress", "");
  //     localStorage.setItem("walletName", "");
  //     setAddress("");
  //     setWalletaccess(false);
  //     keysToRemove.forEach((key) => localStorage.removeItem(key));
  //     localStorage.removeItem("walletDetails");
  //     setWallet(null);
  //     console.log("Wallet fully disconnected + state cleared.");
  //   } catch (err) {
  //     console.error("Disconnect error:", err);
  //   }
  // };

  // useEffect(() => {
  //   const walletButton = createAppKitWalletButton();
  //   setAppKitWalletButton(walletButton);
  // }, []);

  const handleNavigate = () => {
    navigate("/markets");
  };

  //    const connectWallet = async (walletName) => {
  //   try {
  //     const connectedWallet = await appKitWalletButton.connect(walletName);

  //     const walletData = {
  //       ...connectedWallet,
  //       name: walletName
  //     };

  //     setWallet(walletData);

  //     localStorage.setItem("walletDetails", JSON.stringify(walletData));

  //     console.log("Connected wallet:", walletData);
  //   } catch (err) {
  //     console.error("Connection error:", err);
  //   }
  // };

  // useEffect(() => {
  //   const clearInitialWalletState = () => {
  //     try {
  //       Object.keys(localStorage)
  //         .filter((key) => key.startsWith("@appkit/"))
  //         .forEach((key) => localStorage.removeItem(key));

  //       [
  //         // "wagmi.recentConnectorId",
  //         // "wagmi.connected",
  //         "walletconnect",
  //         "wc@2:client",
  //         "WALLETCONNECT_DEEPLINK_CHOICE",
  //       ].forEach((key) => localStorage.removeItem(key));

  //       console.log("Wallet cache cleared on initial page load.");
  //     } catch (error) {
  //       console.error("Clear error:", error);
  //     }
  //   };

  //   clearInitialWalletState();
  // }, []);

  // const walletData = [
  //   {
  //     id: 1,
  //     img: obrd_middl_wllImg1,
  //     heading: "MetaMask",
  //     keys: "metamask",
  //     description: "Popular Ethereum & EVM wallet for DeFi, NFTs, and dApps",
  //     connectStatus: true,
  //   },
  //   // {
  //   //   id: 2,
  //   //   img: obrd_middl_wllImg2,
  //   //   heading: "Coinbase Wallet",
  //   //   keys: "coinbase",
  //   //   description: "Secure self-custody wallet backed by Coinbase exchange",
  //   // },
  //   {
  //     id: 3,
  //     img: phantom,
  //     heading: "Phantom",
  //     keys: "phantom",
  //     description:
  //       "Leading Solana wallet for fast transactions, NFTs, and DeFi",
  //   },
  //   {
  //     id: 3,
  //     img: walletIMG,
  //     heading: "Create Wallet",
  //     keys: "newwallet",
  //     description:
  //       "Leading Solana wallet for fast transactions, NFTs, and DeFi",
  //   },
  //   // {
  //   //   id: 4,
  //   //   img: solsfare,
  //   //   heading: "Solflare",
  //   //   keys: "solflare",
  //   //   description: "Secure Solana wallet with staking and hardware support",
  //   // },
  // ];

  /* ── CHANGE-2: walletData — rename "Create Wallet" → "My Deposit Address", reorder ── Implemented ── END CHANGE-2 ── */
  const walletData = [
    {
      id: 1,
      img: walletIMG,
      heading: "My Deposit Address",
      keys: "newwallet",
      description:
        "Your Arken-managed wallet on ARB & SOL — used for all on-chain activity",
      isSystem: true,
    },
    {
      id: 2,
      img: obrd_middl_wllImg1,
      heading: "MetaMask / EVM",
      keys: "metamask",
      description:
        "Connect to deposit funds from your EVM wallet into your Arken address",
      connectStatus: true,
    },
    {
      id: 3,
      img: phantom,
      heading: "Phantom / Solana",
      keys: "phantom",
      description:
        "Connect to deposit funds from your Phantom wallet into your Arken address",
    },
  ];

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.expand();
      console.log("Telegram Web App initialized", tg);
    } else {
      console.warn("Not running inside Telegram Web App");
    }
    getBalance();
  }, []);

  const [UsdtBalance, setUsdtBalance, UsdtBalanceref] = useState(0);
  const [solBalance, setsolBalance, solBalanceref] = useState(0);
  const [ArbBalance, setArbBalance, ArbBalanceref] = useState(0);
  const getBalance = async () => {
    try {
      //  const telegramUserID = telegramUser.telegramId;
      // // const telegramUserID = Number("1453204703");
      // if (!telegramUserID) {
      //   console.error("Telegram user not found");
      //   setLoadingBalance(false);
      //   return;
      // }

      const data = {
        apiUrl: apiService.get_user_balance,
        payload: { telegramId: teleId },
      };

      const resp = await postMethod(data);

      if (resp.success) {
        setUsdtBalance(resp.totalUsdt);
        setsolBalance(resp.totalSol);
        setArbBalance(resp.totalARB);
        console.log("Active bets fetched:", resp);
      } else {
        console.error(resp.message || "Failed to fetch active bets");
      }
    } catch (error) {
      console.error("Error fetching Wallet balance:", error);
    }
  };

  const connectWallet = async (key) => {
    try {
      setwalletLoading(key);
      setloadstatus(true);
      if (key === "metamask") return handleMetaMaskConnect("metamask");
      if (key === "coinbase") return connectWalletnew("phantom");
      if (key === "phantom") return handlePhantomConnect("phantom");
      if (key === "solflare") return handleSolflareConnect("solflare");
      if (key === "newwallet") return createNewWallet("newwallet");
    } catch (err) {
      setloadstatus(false);
      setwalletLoading(null);
      console.error("Wallet connect error:", err);
    }
  };

  // Clear spinner once wallet is confirmed connected
  useEffect(() => {
    if (walletaccess) {
      setloadstatus(false);
      setwalletLoading(null);
    }
  }, [walletaccess]);
  const [selectNetwork, setSelectNetwork] = useState("");
  const [ChoosewalletStatus, setChoosewalletStatus] = useState(false);
  const [custodialWallets, setCustodialWallets] = useState([]);
  const walletCreationAttempted = useRef(false);

  /* ── CHANGE-1: resolvedTelegramId + activeChain/switchChain + bothWallets ── Implemented ── END CHANGE-1 ── */
  const resolvedTelegramId = telegramUser?.telegramId || "5100502824";
  const [activeChain, setActiveChain] = useState(
    localStorage.getItem("activeChain") || "ARB",
  );
  const switchChain = (chain) => {
    setActiveChain(chain);
    localStorage.setItem("activeChain", chain);
  };
  const [bothWallets, setBothWallets] = useState({ arb: null, sol: null });

  // const createNewWallet = async (key) => {
  //   setwalletName(key);
  //   localStorage.setItem("walletName", "newwallet");
  //   setChoosewalletStatus(true);
  // };

  /* ── CHANGE-4: createNewWallet — wallets auto-created on mount; button just reconnects ── */
  const createNewWallet = async (key) => {
    setwalletName(key);
    localStorage.setItem("walletName", "newwallet");
    if (custodialWallets.length > 0) {
      // Wallets already in state — reconnect immediately
      reconnectCustodialWallet();
      return;
    }
    // Wallets not in state yet (user clicked before first poll returned)
    // If auto-creation hasn't fired yet, trigger it; otherwise wait for poll
    if (!walletCreationAttempted.current) {
      walletCreationAttempted.current = true;
      await createNewWalletFunc();
    } else {
      setWalletload(true); // show loading until poll returns with wallets
    }
  };

  // Reconnects user to their existing custodial wallet(s) without creating a new one
  // const reconnectCustodialWallet = () => {
  //   const firstWallet = custodialWallets[0];
  //   if (!firstWallet) return;
  //   localStorage.setItem("walletName", "newwallet");
  //   localStorage.setItem("walletAddress", firstWallet.address);
  //   setwalletName("newwallet");
  //   setAddress(firstWallet.address);
  //   setWalletaccess(true);
  // };

  /* ── CHANGE-3: reconnectCustodialWallet — dual-chain, accepts direct wallet list ── */
  const reconnectCustodialWallet = (walletsArg) => {
    // Accept wallets directly (avoids stale state) or fall back to state
    const wallets = walletsArg || custodialWallets;
    if (!wallets.length) return;
    const isARB = (w) => (w.network || "").toUpperCase().includes("ARB");
    const isSOL = (w) => (w.network || "").toUpperCase().includes("SOL");
    const arbWallet = wallets.find(isARB) || null;
    const solWallet = wallets.find(isSOL) || null;
    if (arbWallet || solWallet) setBothWallets({ arb: arbWallet, sol: solWallet });
    const activeWallet =
      wallets.find((w) => (w.network || "").toUpperCase() === activeChain) ||
      wallets[0];
    const addr = activeWallet?.address || activeWallet?.walletAddress || "";
    localStorage.setItem("walletName", "newwallet");
    localStorage.setItem("walletAddress", addr);
    setwalletName("newwallet");
    setAddress(addr);
    setWalletaccess(true);
  };

  const copyPrivateKey = async () => {
    toast.success("Private Key copied");
    navigator.clipboard.writeText(privateKey);
  };

  const copyAddress = async () => {
    toast.success("Wallet ID copied");
    navigator.clipboard.writeText(Address);
  };

  const [showOtpBox, setshowOtpBox] = useState(false);
  const [showprivateBox, setshowprivateBox] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleOtpChange = (e) => {
    const value = e.target.value;
    // Validation: Only allow numbers
    if (value && !/^\d*$/.test(value)) {
      setError("verificaiton code is required");
      return;
    }
    if (value.length > 6) return;
    setError("");
    setOtp(value);
  };

  const [sendOtpLoader, setsendOtpLoader] = useState(false);
  const [verifyOtpLoader, setverifyOtpLoader] = useState(false);
  const [resendOtpLoader, setresendOtpLoader] = useState(false);
  const send_otp = async () => {
    try {
      const obj = {
        telegramId: telegramUser?.telegramId || "5100502824",
      };
      setsendOtpLoader(true);
      const resp = await postMethod({
        apiUrl: apiService.send_otp,
        payload: obj,
      });
      setsendOtpLoader(false);
      if (resp.status) {
        showSuccessToast(resp.message);
        setshowOtpBox(true);
        setTimer(300);
      } else {
        if (resp.message == "Please wait before requesting a new code") {
          setshowOtpBox(true);
          setTimer(0);
        } else {
          showErrorToast(resp.message);
        }
      }
    } catch (error) {}
  };
  const verifyOTP = async () => {
    try {
      if (!otp) {
        setError("verificaiton code is required");
        return;
      }
      setverifyOtpLoader(true);
      const obj = {
        telegramId: telegramUser?.telegramId || "5100502824",
        code: otp,
      };
      const resp = await postMethod({
        apiUrl: apiService.verify_otp,
        payload: obj,
      });
      setverifyOtpLoader(false);

      if (resp.status) {
        showSuccessToast(resp.message);
        setshowOtpBox(false);
        setshowprivateBox(true);
        setTimer(0);
      } else {
        if (
          resp.message ==
          "No verification code found. Please request a new one."
        ) {
          showErrorToast(
            "Too many failed attempts. Please request a new code.",
          );

          setTimer(0);
        } else {
          showErrorToast(resp.message);
        }
      }
    } catch (error) {}
  };

  const resend_otp = async () => {
    try {
      const obj = {
        telegramId: telegramUser?.telegramId || "5100502824",
      };
      setresendOtpLoader(true);
      const resp = await postMethod({
        apiUrl: apiService.resend_otp,
        payload: obj,
      });
      setresendOtpLoader(false);

      if (resp.status) {
        showSuccessToast(resp.message);
        setshowOtpBox(true);
        setTimer(300);
      } else {
        showErrorToast(resp.message);
      }
    } catch (error) {}
  };
  const [walletLoad, setWalletload] = useState();
  // const createNewWalletFunc = async (data) => {
  //   try {
  //     setWalletload(true);
  //     const obj = {
  //       network: data?.value || selectNetwork?.value,
  //       telegramId: telegramUser?.telegramId || "5100502824",
  //     };
  //     localStorage.setItem("walletName", "newwallet");
  //     localStorage.setItem(
  //       "selectNetwork",
  //       data?.value || selectNetwork?.value,
  //     );
  //     const resp = await postMethod({
  //       apiUrl: apiService.createNewWallet,
  //       payload: obj,
  //     });
  //     setWalletload(false);

  //     if (resp.status) {
  //       showSuccessToast(resp.message);
  //       setwalletDetails(resp.data);
  //       setAddress(resp.data.address);
  //       localStorage.setItem("walletAddress", resp.data.address);
  //       setwalletLoading(false);
  //       setWalletaccess(true);
  //       setChoosewalletStatus(false);
  //       // console.log("MetaMask wallet linked");
  //     } else {
  //       showErrorToast(resp.message);
  //       // alert(resp.message);
  //     }
  //   } catch (error) {}
  // };

  /* ── CHANGE-5: createNewWalletFunc — creates both ARB+SOL wallets ── */
  const createNewWalletFunc = async () => {
    try {
      setWalletload(true);
      localStorage.setItem("walletName", "newwallet");

      // Call backend twice — one per chain (backward compatible with existing endpoint)
      const [respARB, respSOL] = await Promise.all([
        postMethod({ apiUrl: apiService.createNewWallet, payload: { network: "ARB", telegramId: resolvedTelegramId } }),
        postMethod({ apiUrl: apiService.createNewWallet, payload: { network: "SOL", telegramId: resolvedTelegramId } }),
      ]);

      setWalletload(false);

      const arb = respARB.status ? respARB.data : null;
      const sol = respSOL.status ? respSOL.data : null;

      if (!arb && !sol) {
        showErrorToast(respARB.message || respSOL.message || "Wallet creation failed");
        return;
      }

      setBothWallets({ arb, sol });
      const defaultAddr = arb?.address || sol?.address;
      setAddress(defaultAddr || "");
      localStorage.setItem("walletAddress", defaultAddr || "");
      localStorage.setItem("activeChain", "ARB");
      setwalletLoading(false);
      setWalletaccess(true);
      setChoosewalletStatus(false);
      showSuccessToast("Wallet created successfully");
    } catch (error) {}
  };

  const connectMetaMaskss = async (key) => {
    try {
      //       console.log("----------",wagmiConfig)

      //  const account = getAccount(wagmiConfig)
      //   console.log(account,"accountaccountaccount")
      //   if (!account.address) return null

      //   const balance = await getBalance(wagmiConfig, {
      //     address: account.address,
      //   })
      // console.log(account.address,
      // balance.formatted,)
      //   return {
      //     address: account.address,
      //     balance: balance.formatted,
      //   }
      //
      // const signer = await provider.getSigner();

      // const address = await signer.getAddress();
      // const balanceWei = await provider.getBalance(address);

      // return {
      //   address,
      //   balance: ethers.formatEther(balanceWei),
      // };
      return;
      // setwalletLoading(key);
      // setloadstatus(true);
      // if (!window.ethereum) return showErrorToast("MetaMask not installed");
      // await window.ethereum.request({ method: "eth_requestAccounts" });
      // const provider = new ethers.BrowserProvider(window.ethereum);
      // const signer = await provider.getSigner();
      // const addr = await signer.getAddress();
      // const bal = await provider.getBalance(addr);
      // console.log(
      //   provider,
      //   "provider",
      //   "signer",
      //   signer,
      //   "addr",
      //   addr,
      //   "bal",
      //   bal
      // );
      // setwalletLoading(key);
      // setloadstatus(false);
      // localStorage.setItem("walletAddress", addr);
      // localStorage.setItem("walletName", "metamask");
      // localStorage.setItem("balance", bal);
      // setwalletName("metamask");
      // setWallet({ name: "metamask" });
      // setAddress(addr);
      // setBalance(ethers.formatEther(bal));
    } catch (error) {
      setloadstatus(false);
      setwalletLoading(key);
      console.log(error, "=-=-=-=-=");
    }
  };

  const signEvmWallet = async (telegramId) => {
    try {
      // if (!window.ethereum) {
      //   throw new Error("EVM wallet not found");
      // }

      // const provider = new ethers.BrowserProvider(window.ethereum);
      if (!wcProvider) {
        await connectWalletMetamask();
      }
      const provider = new ethers.BrowserProvider(wcProvider);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      const message = `Link wallet to Telegram ID: ${telegramId}`;
      const signature = await signer.signMessage(message);

      return {
        chain: "EVM",
        address,
        signature,
        message,
      };
    } catch (error) {
      console.error("EVM sign error:", error);
      throw error;
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const publicKey = params.get("public_key");
    const signature = params.get("signed_message");

    if (publicKey && signature) {
      console.log("Wallet connected:", publicKey);
    }
  }, []);

  // const handleCoinbaseConnect = async (key) => {
  // const appUrl = "https://arken.blfdemo.online";
  // const phantomLink = `https://phantom.app/ul/v1/connect?app_url=${encodeURIComponent(appUrl)}`;

  // // Fallback timer
  // // const fallback = setTimeout(() => {
  // //   alert("Phantom app not installed. Please install it first: https://phantom.app/download");
  // // }, 1500);

  // // Try to open Phantom
  // window.location.href = phantomLink;

  // // Clear fallback if redirect works (will leave page)
  // window.onblur = () => clearTimeout(fallback);
  // };

  useEffect(() => {
    if (isConnected && connectors?.id === "walletConnect") {
      // alert("ok")
      localStorage.setItem("walletName", "metamask");
      setWalletAddress(address);
      setWalletaccess(true);
    }
  }, [isConnected, connectors, address]);
  const handleMetaMaskConnect = async () => {
    try {
      setwalletLoading(true);
      await connectWalletMetamask();
      setWalletaccess(true);
      const signedWallet = await signEvmWallet(telegramUser.telegramId);
      const resp = await postMethod({
        apiUrl: apiService.verifyWallet,
        payload: {
          telegramId: telegramUser.telegramId,
          ...signedWallet,
        },
      });
      if (resp.success) {
        setwalletLoading(false);
        setWalletaccess(true);
        console.log("MetaMask wallet linked");
      } else {
        // alert(resp.message);
      }
    } catch (error) {
      // alert(`error for first:${error}`)
      console.error("MetaMask connection failed:", error);
    } finally {
      setwalletLoading(false);
    }
  };

  // const handleMetaMaskConnect = async (key) => {
  //   try {
  //     await connectMetaMask(key)

  //     const signedWallet = await signEvmWallet(telegramUser.telegramId);

  //     const resp = await postMethod({
  //       apiUrl: apiService.verifyWallet,
  //       payload: {
  //         telegramId: telegramUser.telegramId,
  //         ...signedWallet,
  //       },
  //     });

  //     if (resp.success) {
  //       setWalletaccess(true);
  //       console.log("MetaMask wallet linked");
  //     } else {
  //       alert(resp.message);
  //     }
  //   } catch (error) {
  //     console.error("MetaMask flow failed:", error);
  //   }
  // };

  // const handleCoinbaseConnect = async (key) => {
  //   try {
  //     await connectCoinbase(key); // your existing function

  //     const signedWallet = await signEvmWallet(telegramUser.telegramId);

  //     const resp = await postMethod({
  //       apiUrl: apiService.verifyWallet,
  //       payload: {
  //         telegramId: telegramUser.telegramId,
  //         ...signedWallet,
  //       },
  //     });

  //     if (resp.success) {
  //       setWalletaccess(true);
  //       console.log("Coinbase wallet linked");
  //     } else {
  //       alert(resp.message);
  //     }
  //   } catch (error) {
  //     console.error("Coinbase flow failed:", error);
  //   }
  // };

  // const connectCoinbase = async (key) => {
  //   try {
  //     setwalletLoading(key);
  //     setloadstatus(true);

  //     const providerId = "com.coinbase.wallet";
  //     const wallet = await appKitWalletButton.connect("coinbase");

  //     const walletData = {
  //       provider: providerId, // provider ID for persistence
  //       label: "coinbase", // UI label
  //       chainNamespace: wallet.chainNamespace,
  //       chainId: wallet.chainId,
  //       address: wallet.address,
  //     };
  //     setwalletLoading(key);
  //     setloadstatus(false);
  //     localStorage.setItem("walletAddress", wallet.address);
  //     localStorage.setItem("walletName", "coinbase");
  //     setwalletName("coinbase");
  //     console.log(walletData, "walletData");
  //   } catch (err) {
  //     setwalletLoading(key);
  //     setloadstatus(false);
  //     if (err.code === 4001) {
  //       console.log("User rejected connection");
  //     } else {
  //       console.error("Coinbase connect error:", err);
  //     }
  //   }
  // };
  const getBalancePhantom = async (walletAddress) => {
    try {
      const connection = new Connection(clusterApiUrl("mainnet-beta"));
      const publicKey = new PublicKey(walletAddress);
      const balance = await connection.getBalance(publicKey);

      const solBalance = balance / LAMPORTS_PER_SOL;
      console.log(`Balance: ${solBalance} SOL`);
      return solBalance;
    } catch (error) {
      console.error("Failed to fetch balance:", error);
    }
  };
  const connectPhantom = async (key) => {
    try {
      const dappKeyPair = nacl.box.keyPair(); // Generate keys for session encryption
      const baseUrl = window.location.origin + window.location.pathname;

      const params = new URLSearchParams({
        app_url:
          import.meta.env.VITE_FRONT_URL || "https://arken.blfdemo.online/",
        dapp_encryption_public_key: bs58.encode(dappKeyPair.publicKey),
        redirect_link: `${baseUrl}?action=onConnect`,
        cluster: "mainnet-beta",
      });

      const url = `phantom.app{params.toString()}`;

      // Use Telegram SDK to open the external wallet app
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.openLink(url);
      } else {
        window.location.href = url;
      }
      getBalancePhantom();
      // setwalletLoading(key);
      // setloadstatus(true);

      // const phantom = new PhantomWalletAdapter();
      // await phantom.connect();

      // const connection = new Connection(SOLANA_RPC);
      // const addr = phantom.publicKey.toBase58();
      // const lamports = await connection.getBalance(phantom.publicKey);
      // setwalletLoading(key);
      // setloadstatus(false);
      // localStorage.setItem("walletAddress", addr);
      // localStorage.setItem("walletName", "phantom");
      // setwalletName("phantom");

      // setWallet({ name: "phantom" });
      // setAddress(addr);
      // setBalance((lamports / LAMPORTS_PER_SOL).toFixed(4));
    } catch (error) {
      console.log(error, "=-=-=-=");
      setloadstatus(false);
      setwalletLoading(key);
    }
  };

  const handleCallback = () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("action") === "onConnect") {
      const phantomPublicKey = urlParams.get("phantom_encryption_public_key");
      // IMPORTANT: In a real app, decrypt the 'data' param to get the actual wallet address
      console.log("Connected Wallet Address:", phantomPublicKey);
      return phantomPublicKey;
    }
  };
  const connectSolflare = async (key) => {
    const solflare = new SolflareWalletAdapter();
    setwalletLoading(key);
    setloadstatus(true);
    try {
      if (!solflare.connected) {
        await solflare.connect();
      }
      const connection = new Connection(SOLANA_RPC);
      const publicKey = solflare.publicKey;
      const addr = publicKey.toBase58();
      const lamports = await connection.getBalance(publicKey);
      setWallet({ name: "solflare" });
      setAddress(addr);
      setloadstatus(false);
      // localStorage.setItem("walletAddress", addr);
      localStorage.setItem("walletName", "solflare");
      setwalletName("solflare");

      setwalletLoading(key);
      setBalance((lamports / LAMPORTS_PER_SOL).toFixed(4));
    } catch (err) {
      await solflare.disconnect();
      console.log(err, "=-=-=-=");
      setloadstatus(false);
      setwalletLoading(key);
      console.error("Solflare error:", err);
      showErrorToast("Please unlock Solflare and try again");
    }
  };

  const chooseCurrency = (value) => {
    setselectedCurrency(value.value);
    setselectedCurrencySymbol(value.label);
    setDepositLimit(value.depositLimt);
    setvalidate(false);
    setvalidationCurrencymsg("");
  };

  const handleChange = (event) => {
    setvalidate(false);
    const sanitizedValue = event.target.value.replace(/[^\d.]/g, "");
    if (!selectedCurrency) {
      setvalidate(true);
      setvalidationCurrencymsg("Choose currency");
    }
    const regex = /^\d+(\.\d{0,6})?$/;
    if (!regex.test(event.target.value)) {
      return; // ❌ block input
    }
    if (
      event.target.value === "0000000000" ||
      event.target.value === "0.00000000" ||
      event.target.value.length === 11
    ) {
      event.target.value = 0;
      setvalidationmsg("Enter valid Amount");
      setvalidate(true);
    }

    if (
      event.target.value.length === "00.0" ||
      event.target.value.length === "000.0" ||
      event.target.value.length === "0000.0"
    ) {
      event.target.value = 0;
      setvalidate(true);
      setvalidationmsg("Enter valid Amount");
    }

    if (sanitizedValue.length < 11) {
      const amount = parseFloat(sanitizedValue);
      if (!isNaN(amount)) {
        setdepositAmount(sanitizedValue);
      } else if (isNaN(amount)) {
        setdepositAmount(sanitizedValue);
      }
    }
  };

  const { signTransaction, sendTransaction } = useWallet();
  const [depositLoader, setdepositLoader] = useState(false);

  const deposit = async () => {
    try {
      if (!depositAmountref.current || Number(depositAmountref.current) <= 0) {
        showErrorToast("Enter valid amount");
        return;
      }

      // SOLFLARE ONLY
      const provider = window.solflare;
      if (!provider) {
        showErrorToast("Solflare wallet not found");
        return;
      }

      setdepositLoader(true);

      // Connect wallet
      try {
        await provider.connect();
      } catch (e) {
        console.error("Wallet connection failed:", e);
        showErrorToast("Wallet connection failed");
        setdepositLoader(false);
        return;
      }

      const connection = new Connection(env.wallet_endpoint, "confirmed");
      const mintAddress = new PublicKey(env.usdt_mint_address);
      const senderPublicKey = provider.publicKey;
      // const receiverPublicKey = new PublicKey(env.Admin_wallet);
      const receiverPublicKey = new PublicKey(depositAddress);

      // ✅ Check SOL balance for fees
      const solBalance = await connection.getBalance(senderPublicKey);
      if (solBalance < 5000) {
        // ~0.000005 SOL for fees
        showErrorToast("Insufficient SOL to pay transaction fees");
        setdepositLoader(false);
        return;
      }

      // -----------------------------
      // 1️⃣ Get USDT decimals
      // -----------------------------
      const mintInfo = await connection.getParsedAccountInfo(mintAddress);
      if (!mintInfo || !mintInfo.value) {
        showErrorToast("Invalid USDT mint address");
        setdepositLoader(false);
        return;
      }
      const decimals = mintInfo.value.data.parsed.info.decimals;
      const amount = Math.round(
        Number(depositAmountref.current) * 10 ** decimals,
      );
      if (amount <= 0) {
        showErrorToast("Invalid amount");
        setdepositLoader(false);
        return;
      }

      // -----------------------------
      // 2️⃣ Derive ATAs
      // -----------------------------
      const senderATA = await getAssociatedTokenAddress(
        mintAddress,
        senderPublicKey,
      );
      const receiverATA = await getAssociatedTokenAddress(
        mintAddress,
        receiverPublicKey,
      );

      // -----------------------------
      // 3️⃣ Check USDT balance
      // -----------------------------
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        senderPublicKey,
        { mint: mintAddress },
      );

      if (!tokenAccounts.value.length) {
        showErrorToast("USDT balance not found");
        setdepositLoader(false);
        return;
      }

      const balance = Number(
        tokenAccounts.value[0].account.data.parsed.info.tokenAmount.amount,
      );
      if (balance < amount) {
        showErrorToast("Insufficient USDT balance");
        setdepositLoader(false);
        return;
      }

      // -----------------------------
      // 4️⃣ Create receiver ATA if needed
      // -----------------------------
      const receiverATAInfo = await connection.getAccountInfo(receiverATA);
      if (!receiverATAInfo) {
        const ataTx = new Transaction().add(
          createAssociatedTokenAccountInstruction(
            senderPublicKey,
            receiverATA,
            receiverPublicKey,
            mintAddress,
          ),
        );

        ataTx.feePayer = senderPublicKey;
        ataTx.recentBlockhash = (
          await connection.getLatestBlockhash()
        ).blockhash;

        try {
          const ataSig = await provider.signAndSendTransaction(ataTx);
          await connection.confirmTransaction(ataSig.signature);
        } catch (e) {
          console.error("Failed to create receiver ATA:", e);
          showErrorToast("Failed to create receiver token account");
          setdepositLoader(false);
          return;
        }
      }

      // -----------------------------
      // 5️⃣ Transfer USDT
      // -----------------------------
      const transferTx = new Transaction().add(
        createTransferCheckedInstruction(
          senderATA,
          mintAddress,
          receiverATA,
          senderPublicKey,
          amount,
          decimals,
        ),
      );

      transferTx.feePayer = senderPublicKey;
      transferTx.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;

      let tx;
      try {
        tx = await provider.signAndSendTransaction(transferTx);
        await connection.confirmTransaction(tx.signature);
      } catch (e) {
        console.error("USDT transfer failed:", e);
        showErrorToast("USDT transfer failed");
        setdepositLoader(false);
        return;
      }

      // -----------------------------
      // 6️⃣ Save to backend
      // -----------------------------
      const payload = {
        telegramId:
          teleId ||
          localStorage.getItem("telegramId") ||
          window.Telegram?.WebApp?.initDataUnsafe?.user?.id,
        walletAddress: senderPublicKey.toString(),
        walletName: "solflare",
        depositAmount: depositAmountref.current,
        currency: selectedCurrency,
        txHash: tx.signature,
      };

      try {
        await postMethod({ apiUrl: apiService.transferToken, payload });
      } catch (e) {
        console.error("Backend save failed:", e);
      }
      showSuccessToast("Deposit successful");
      navigate("/markets");
    } catch (err) {
      console.error("Deposit error:", err);
      showErrorToast(err?.message || "Transaction failed");
    } finally {
      setdepositLoader(false);
      setdepositAmount(0);
    }
  };

  // const deposit = async () => {
  //   try {
  //     if (!depositAmountref.current || Number(depositAmountref.current) <= 0) {
  //       showErrorToast("Enter valid amount");
  //       return;
  //     }

  //     // SOLFLARE ONLY
  //     const provider = window.solflare;
  //     if (!provider) {
  //       showErrorToast("Solflare wallet not found");
  //       return;
  //     }

  //     setdepositLoader(true);

  //     // connect wallet
  //     await provider.connect();

  //     const connection = new Connection(SOLANA_RPC, "confirmed");

  //     const mintAddress = new PublicKey(env.usdt_mint_address);
  //     const senderPublicKey = provider.publicKey;
  //     const receiverPublicKey = new PublicKey(env.Admin_wallet);

  //     // -----------------------------
  //     // 1️⃣ GET USDT DECIMALS
  //     // -----------------------------
  //     const mintInfo = await connection.getParsedAccountInfo(mintAddress);
  //     const decimals = mintInfo.value.data.parsed.info.decimals;
  //     // const decimals = 6;

  //     const amount = Math.round(
  //       Number(depositAmountref.current) * 10 ** decimals
  //     );
  // console.log(amount,"amount",Number(depositAmountref.current) * 10 ** decimals)
  //     if (amount <= 0) {
  //       showErrorToast("Invalid amount");
  //       setdepositLoader(false);
  //       return;
  //     }

  //     // -----------------------------
  //     // 2️⃣ DERIVE ATAs
  //     // -----------------------------
  //     const senderATA = await getAssociatedTokenAddress(
  //       mintAddress,
  //       senderPublicKey
  //     );

  //     const receiverATA = await getAssociatedTokenAddress(
  //       mintAddress,
  //       receiverPublicKey
  //     );

  //     // -----------------------------
  //     // 3️⃣ CHECK BALANCE
  //     // -----------------------------
  //     // const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
  //     // senderPublicKey,
  //     // mintAddress
  //     // );
  // const tokenAccounts =
  //   await connection.getParsedTokenAccountsByOwner(
  //     senderPublicKey,
  //    {
  //     mint:new PublicKey(env.usdt_mint_address)
  //    }
  //   );

  //     if (!tokenAccounts.value.length) {
  //       showErrorToast("USDT balance not found");
  //       setdepositLoader(false);
  //       return;
  //     }

  //     const balance =
  //       tokenAccounts.value[0].account.data.parsed.info.tokenAmount.amount;

  //     if (Number(balance) < amount) {
  //       showErrorToast("Insufficient USDT balance");
  //       setdepositLoader(false);
  //       return;
  //     }

  //     // -----------------------------
  //     // 4️⃣ TX #1 – CREATE RECEIVER ATA (IF NEEDED)
  //     // -----------------------------
  //     const receiverATAInfo = await connection.getAccountInfo(receiverATA);

  //     if (!receiverATAInfo) {
  //       const ataTx = new Transaction().add(
  //         createAssociatedTokenAccountInstruction(
  //           senderPublicKey,
  //           receiverATA,
  //           receiverPublicKey,
  //           mintAddress
  //         )
  //       );

  //       ataTx.feePayer = senderPublicKey;
  //       ataTx.recentBlockhash = (
  //         await connection.getLatestBlockhash()
  //       ).blockhash;

  //       const ataSig = await provider.signAndSendTransaction(ataTx);
  //       await connection.confirmTransaction(ataSig.signature);
  //     }

  //     // -----------------------------
  //     // 5️⃣ TX #2 – TRANSFER USDT
  //     // -----------------------------
  //     const transferTx = new Transaction().add(
  //       createTransferCheckedInstruction(
  //         senderATA,
  //         mintAddress,
  //         receiverATA,
  //         senderPublicKey,
  //         amount,
  //         decimals
  //       )
  //     );

  //     transferTx.feePayer = senderPublicKey;
  //     transferTx.recentBlockhash = (
  //       await connection.getLatestBlockhash()
  //     ).blockhash;

  //     const tx = await provider.signAndSendTransaction(transferTx);
  //     await connection.confirmTransaction(tx.signature);

  //     // -----------------------------
  //     // 6️⃣ SAVE TO BACKEND
  //     // -----------------------------
  //     const payload = {
  //       telegramId:
  //         teleId ||
  //         localStorage.getItem("telegramId") ||
  //         window.Telegram?.WebApp?.initDataUnsafe?.user?.id,
  //       walletAddress: senderPublicKey.toString(),
  //       walletName: "solflare",
  //       depositAmount: depositAmountref.current,
  //       currency: "USDT",
  //       txHash: tx.signature,
  //     };

  //     await postMethod({
  //       apiUrl: apiService.transferToken,
  //       payload,
  //     });

  //     showSuccessToast("Deposit successful");
  //     navigate("/markets");

  //   } catch (err) {
  //     alert(err)
  //     console.error(err);
  //     showErrorToast("Transaction failed");
  //   } finally {
  //     setdepositLoader(false);
  //     setdepositAmount(0);
  //   }
  // };

  //import   const deposit = async () => {
  //     //usdt
  //     try {
  //       if (!selectedCurrency) {
  //         setvalidate(true);
  //         setvalidationCurrencymsg("Choose currency");
  //         return;
  //       }

  //       if (!depositAmountref.current) {
  //         setvalidate(true);
  //         setvalidationmsg("Enter Amount");
  //         return;
  //       }
  //       console.log(walletName, "walletName");

  //       let provider;
  //       if (walletName === "solflare") provider = window.solflare;
  //       if (walletName === "phantom") provider = window.solana;

  //       if (!provider) {
  //         showErrorToast("Wallet not found");
  //         return;
  //       }
  //       setdepositLoader(true);
  //       if (provider.connect) await provider.connect();

  //       const connection = new web3.Connection(env.wallet_endpoint);
  //       const mintAddress = new PublicKey(env.usdt_mint_address);
  //       const senderPublicKey = provider.publicKey;
  //       const receiverPublicKey = new PublicKey(env.Admin_wallet);

  //       // decimals
  //       const mintInfo = await connection.getParsedAccountInfo(mintAddress);
  //       const decimals = mintInfo.value.data.parsed.info.decimals|| 6;
  //       // const amount = depositAmountref.current * Math.pow(10, decimals);
  //       const amount = BigInt(
  //   Math.round(Number(depositAmountref.current) * 10 ** decimals)
  // )
  //       console.log(amount,"amount")
  //       console.log(depositAmountref.current,"depositAmountref.current",Math.pow(10, decimals))
  //       let balance = 0;
  //       const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
  //         senderPublicKey,
  //         {
  //           mint: mintAddress,
  //         }
  //       );
  //       if (tokenAccounts.value.length > 0) {
  //         balance =
  //           tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
  //       }
  //       console.log("USDT Balance:", balance);
  //       // derive ATAs
  //       const senderATA = await getAssociatedTokenAddress(
  //         mintAddress,
  //         senderPublicKey
  //       );
  //       console.log("senderATA:", senderATA);

  //       const receiverATA = await getAssociatedTokenAddress(
  //         mintAddress,
  //         receiverPublicKey
  //       );
  //       console.log("receiverATA:", receiverATA);

  //       const transaction = new Transaction();
  //       console.log("transaction:", transaction);

  //       // create sender ATA if missing
  //       if (!(await connection.getAccountInfo(senderATA))) {
  //         transaction.add(
  //           createAssociatedTokenAccountInstruction(
  //             senderPublicKey, // payer
  //             senderATA,
  //             senderPublicKey,
  //             mintAddress
  //           )
  //         );
  //       }

  //       // create receiver ATA if missing
  //       if (!(await connection.getAccountInfo(receiverATA))) {
  //         transaction.add(
  //           createAssociatedTokenAccountInstruction(
  //             senderPublicKey, // payer
  //             receiverATA,
  //             receiverPublicKey,
  //             mintAddress
  //           )
  //         );
  //       }

  //       // transfer USDT
  //       transaction.add(
  //         createTransferInstruction(
  //           senderATA,
  //           receiverATA,
  //           senderPublicKey,
  //           amount,
  //           [],
  //           TOKEN_PROGRAM_ID
  //         )
  //       );
  //       console.log("transaction22:", transaction);

  //       transaction.feePayer = senderPublicKey;
  //       transaction.recentBlockhash = (
  //         await connection.getLatestBlockhash()
  //       ).blockhash;

  //       // sign & send (Solflare / Phantom)
  //       const tx = await provider.signAndSendTransaction(transaction);
  //       console.log(tx,"tx")
  //       await connection.confirmTransaction(tx.signature);
  //       const obj = {
  //         telegramId:
  //           teleId ||
  //           localStorage.getItem("telegramId") ||
  //           window.Telegram?.WebApp?.initData,
  //         walletAddress: senderPublicKey.toString(),
  //         WaletName: walletName,
  //         depositAmount: depositAmountref.current,
  //         currency: selectedCurrency,
  //         txHash: tx.signature,
  //       };
  //       var data = {
  //         apiUrl: apiService.transferToken,
  //         payload: obj,
  //       };
  //       var resp = await postMethod(data);
  //       setdepositLoader(false);

  //       if (resp.success) {
  //         showSuccessToast(resp.message);
  //                     navigate("/markets");

  //       } else {
  //         showErrorToast("Transaction failed, please try again");
  //       }
  //       setdepositAmount(0);
  //     } catch (err) {
  //       // const obj = {
  //       //   walletAddress: Address,
  //       //   WaletName: localStorage.getItem("walletName"),
  //       //   depositAmount: depositAmountref.current,
  //       //   telegramId: "XXXXX",
  //       //   currency: selectedCurrency,
  //       // };
  //       // var data = {
  //       //   apiUrl: apiService.transferToken,
  //       //   payload: obj,
  //       // };
  //       // var resp = await postMethod(data);
  //       // if (resp.success) {
  //       //   showSuccessToast(resp.message);
  //       // } else {
  //       //   showErrorToast("Transaction failed, please try again");
  //       // }
  //       setdepositLoader(false);
  //       setdepositAmount(0);
  //       setselectedCurrency("");
  //       setselectedCurrencySymbol("");
  //       console.error(err);
  //       alert(err)
  //       showErrorToast("Transaction failed, try again");
  //     }
  //   };

  //   const deposit =async ()=>{

  // if(walletName=="solflare"){
  //  try {
  //      if(!selectedCurrency){
  //     setvalidate(true);
  //     setvalidationCurrencymsg("Choose currency")
  //     return
  //    }
  //      if(!depositAmountref.current){
  //     setvalidate(true);
  //     setvalidationmsg("Enter Amount")
  //     return
  //    }
  //     const get_balance = localStorage.getItem("balance")
  //     // if(depositAmountref.current>get_balance){
  //     //   showErrorToast('Insufficient Balance')
  //     // return
  //     // }
  //         const provider = window.solflare;

  //        const connection = new web3.Connection(
  //           env.wallet_endpoint
  //         );
  //          const mintAddress = new PublicKey(env.usdt_mint_address);
  //          console.log(mintAddress,env.usdt_mint_address, "mintAddress")
  //           const senderPublicKey = new PublicKey(provider.publicKey);
  //           const receiverPublicKey = new PublicKey(env.Admin_wallet);
  //           const parsedAccountInfo = await connection.getParsedAccountInfo(
  //             mintAddress
  //           );
  //           // Access the token's decimal places
  //           // const decimals = sparsedAccountInfo.value.data.lamports;
  //           const decimals = parsedAccountInfo.value.data.parsed.info.decimals;
  //           const amountInSmallestUnit = Number(depositAmountref.current) * Math.pow(10, decimals);
  //           const senderTokenAccount =
  //             await token.getOrCreateAssociatedTokenAccount(
  //               connection,
  //               senderPublicKey, // The public key of the sender's wallet
  //               mintAddress,
  //               senderPublicKey,
  //               signTransaction
  //             );
  //           // Get the receiver's token account
  //           const receiverTokenAccount =
  //             await token.getOrCreateAssociatedTokenAccount(
  //               connection,
  //               senderPublicKey, // The public key of the sender's wallet
  //               mintAddress,
  //               receiverPublicKey, // The public key of the receiver's
  //               signTransaction
  //             )
  //             // .then((res)=>console.log(res)).then((err)=>console.log(err,"-0000-00--0-"))
  //           // Create the transfer transaction
  //           const transaction = new Transaction().add(
  //             token.createTransferInstruction(
  //               senderTokenAccount.address,
  //               receiverTokenAccount.address,
  //               new PublicKey(provider.publicKey), // The public key of the sender's wallet.
  //               amountInSmallestUnit,
  //               [],
  //               TOKEN_PROGRAM_ID
  //             )
  //           );

  //           const blockhash = await connection.getLatestBlockhash();
  //           transaction.recentBlockhash = blockhash.blockhash;
  //           transaction.feePayer = new PublicKey(Address);
  //           const signedTransaction =
  //             await window.solflare.signAndSendTransaction(transaction);
  //            const obj={
  //             walletAddress:Address,
  //             WaletName:localStorage.getItem("walletName"),
  //             depositAmount:depositAmountref.current,
  //             telegramId: "-0-0-0-0",
  //             currency: selectedCurrency,
  //           }

  //           if (signedTransaction) {
  //              var data = {
  //               apiUrl: apiService.transferToken,
  //               payload:obj
  //             }
  //             var resp = await postMethod(data);
  //             setBuyButtonLoader(false);
  //             localStorage.setItem("tokenBalance", "");
  //             if (resp.status == true) {
  //               showSuccessToast(`Token Purchased Successfully!`);
  //               setdepositAmount(0);
  //               setRexiAmount(0);
  //             } else {
  //               showErrorToast(resp.Message);
  //             }
  //           } else {
  //             setBuyButtonLoader(true);
  //             showErrorToast("Something Went Wroung ,Please try again later");

  //           }

  //   } catch (error) {
  //      const obj={
  //             walletAddress:Address,
  //             WaletName:localStorage.getItem("walletName"),
  //             depositAmount:depositAmountref.current,
  //             telegramId: "XXXXX",
  //             currency: selectedCurrency,
  //           }
  //     var data = {
  //               apiUrl: apiService.transferToken,
  //               payload:obj
  //             }
  //             var resp = await postMethod(data);

  //             showErrorToast("Something Went Wroung ,Please try again later");
  //     console.log(error,"=========================");
  //   }
  // }
  // try {
  //     if (!selectedCurrency) {
  //       setvalidate(true);
  //       setvalidationCurrencymsg("Choose currency");
  //       return;
  //     }

  //     if (!depositAmountref.current) {
  //       setvalidate(true);
  //       setvalidationmsg("Enter Amount");
  //       return;
  //     }

  //     const provider = window.solana; // ✅ Phantom
  //     if (!provider?.isPhantom) {
  //       showErrorToast("Please install Phantom Wallet");
  //       return;
  //     }

  //     await provider.connect();

  //     const connection = new web3.Connection(env.wallet_endpoint);

  //     const mintAddress = new PublicKey(env.usdt_mint_address); // ✅ Solana USDT
  //     const senderPublicKey = provider.publicKey;
  //     const receiverPublicKey = new PublicKey(env.Admin_wallet);

  //     // Get USDT decimals
  //     const mintInfo = await connection.getParsedAccountInfo(mintAddress);
  //     const decimals = mintInfo.value.data.parsed.info.decimals;

  //     const amountInSmallestUnit =
  //       Number(depositAmountref.current) * Math.pow(10, decimals);

  //     // Sender token account
  //     const senderTokenAccount =
  //       await token.getAssociatedTokenAddress(
  //         mintAddress,
  //         senderPublicKey
  //       );

  //     // Receiver token account
  //     const receiverTokenAccount =
  //       await token.getAssociatedTokenAddress(
  //         mintAddress,
  //         receiverPublicKey
  //       );

  //     // Create transfer instruction
  //     const transaction = new Transaction().add(
  //       token.createTransferInstruction(
  //         senderTokenAccount,
  //         receiverTokenAccount,
  //         senderPublicKey,
  //         amountInSmallestUnit,
  //         [],
  //         TOKEN_PROGRAM_ID
  //       )
  //     );

  //     transaction.feePayer = senderPublicKey;
  //     transaction.recentBlockhash =
  //       (await connection.getLatestBlockhash()).blockhash;

  //     // ✅ Phantom sign & send
  //     const signedTx = await provider.signAndSendTransaction(transaction);
  //     await connection.confirmTransaction(signedTx.signature);

  //     showSuccessToast("USDT deposited successfully!");
  //     setdepositAmount(0);

  //   } catch (error) {
  //     console.error(error);
  //     showErrorToast("Transaction failed, please try again");
  //   }
  // }
  const depositCurrency = async () => {
    try {
      if (!selectedCurrency) {
        setvalidate(true);
        setvalidationCurrencymsg("Choose currency");
        return;
      }

      if (!depositAmountref.current) {
        setvalidate(true);
        setvalidationmsg("Enter Amount");
        return;
      }
      setdepositLoader(true);
      if (walletName == "solflare") {
        const wallet = window.solflare;

        await wallet.connect();

        const connection = new web3.Connection(
          env.wallet_endpoint,
          "confirmed",
        );
        const { blockhash } = await connection.getLatestBlockhash();

        const lamports =
          Number(depositAmountref.current) * web3.LAMPORTS_PER_SOL;

        // 2. Create Transaction
        const transaction = new web3.Transaction().add(
          web3.SystemProgram.transfer({
            fromPubkey: wallet.publicKey, // Use the public key from the SDK
            toPubkey: new web3.PublicKey(env.Admin_wallet),
            lamports: lamports,
          }),
        );

        transaction.recentBlockhash = blockhash;
        transaction.feePayer = wallet.publicKey;

        // 3. Sign and Send in one step
        const signature = await wallet.signAndSendTransaction(transaction);
        console.log("Tx hash:", signature);
        if (signature) {
          const obj = {
            walletAddress: localStorage.getItem("walletAddress"),
            WaletName: localStorage.getItem("walletName") || "solflare",
            depositAmount: depositAmountref.current,
            // transactionHash: signature,
            hash: signature,
            telegramId: teleId || localStorage.getItem("telegramId"),
            currency: selectedCurrency,
          };
          var data = {
            apiUrl: apiService.transferToken,
            payload: obj,
          };
          var resp = await postMethod(data);
          setdepositLoader(false);

          if (resp.success) {
            showSuccessToast(resp.message);
            navigate("/markets");
            // alert(resp.data)
          } else {
            // alert(resp)
            showErrorToast("Transaction failed, please try again");
          }
        }
        // } else {
        //   try {
        //     if (!selectedCurrency) {
        //       setvalidate(true);
        //       setvalidationCurrencymsg("Choose currency");
        //       return;
        //     }

        //     if (!depositAmountref.current) {
        //       setvalidate(true);
        //       setvalidationmsg("Enter Amount");
        //       return;
        //     }

        //     // ✅ Phantom provider
        //     const provider = window.solana;

        //     if (!provider || !provider.isPhantom) {
        //       showErrorToast("Phantom wallet not found");
        //       return;
        //     }

        //     const connection = new web3.Connection(
        //       env.wallet_endpoint,
        //       "confirmed"
        //     );

        //     const fromPublicKey = new web3.PublicKey(Address);
        //     const toPublicKey = new web3.PublicKey(env.Admin_wallet);

        //     const lamports =
        //       Number(depositAmountref.current) * web3.LAMPORTS_PER_SOL;

        //     // Get recent blockhash
        //     const { blockhash } = await connection.getLatestBlockhash();

        //     const transaction = new web3.Transaction({
        //       recentBlockhash: blockhash,
        //       feePayer: fromPublicKey,
        //     }).add(
        //       web3.SystemProgram.transfer({
        //         fromPubkey: fromPublicKey,
        //         toPubkey: toPublicKey,
        //         lamports,
        //       })
        //     );

        //     // ✅ Phantom signs transaction
        //     const signedTransaction = await provider.signTransaction(transaction);

        //     // Send transaction
        //     const signature = await connection.sendRawTransaction(
        //       signedTransaction.serialize()
        //     );

        //     // Confirm transaction
        //     await connection.confirmTransaction(signature, "confirmed");

        //     if (signature) {
        //       const obj = {
        //         walletAddress: Address,
        //         WaletName: localStorage.getItem("walletName"), // "phantom"
        //         depositAmount: depositAmountref.current,
        //         telegramId:localStorage.setItem("telegramId"),
        //         currency: selectedCurrency,
        //         txHash: signature,
        //       };

        //       const data = {
        //         apiUrl: apiService.transferToken,
        //         payload: obj,
        //       };

        //       const resp = await postMethod(data);

        //       if (resp.success) {
        //         showSuccessToast(resp.message);
        //       } else {
        //         showErrorToast("Transaction failed, please try again");
        //       }
        //     }
        //     setdepositAmount(0);
        //     setselectedCurrency("");
        //     setselectedCurrencySymbol("");
        //     console.error(err);
        //   } catch (err) {
        //     console.error(err);
        //     setdepositAmount(0);
        //     setselectedCurrency("");
        //     setselectedCurrencySymbol("");
        //     console.error(err);
        //     showErrorToast(err.message || "Transaction failed");
        //   }
        // }
      } else if (walletName == "metamask") {
      }
    } catch (error) {
      console.error(error);
      setdepositLoader(false);
      showErrorToast(error);
    }
  };

  const deposit3 = async () => {
    if (!window.ethereum) {
      showErrorToast("Please install MetaMask");
      return;
    }

    await window.ethereum.request({ method: "eth_requestAccounts" });

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const USDT_ADDRESS = env.usdt_mint_address; // Ethereum USDT

    const USDT_ABI = [
      "function transfer(address to, uint256 amount) public returns (bool)",
      "function decimals() view returns (uint8)",
    ];

    const usdt = new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer);
    const decimals = await usdt.decimals();

    const amount = ethers.parseUnits(
      depositAmountref.current.toString(),
      decimals,
    );

    const tx = await usdt.transfer(env.Admin_wallet, amount);
    await tx.wait();

    showSuccessToast("USDT deposited successfully");
  };

  return (
    <div className="cmmn_bdy_mainwrp" style={pageStyle.cmmn_bdy_mainwrp}>
      <div className="obrd_wrp_main" style={pageStyle.obrd_wrp_main}>
        <div className="obrd_back_wrp" style={pageStyle.obrd_back_wrp}>
          <span
            style={pageStyle.obrd_back_txt}
            onClick={() => {
              handleStepReduce();
            }}
          >
            <MdOutlineArrowBackIosNew style={pageStyle.obrd_back_txt2} /> Back
          </span>
          {onboardStep < 3 ? (
            <h6 style={pageStyle.obrd_back_lgtxt}>
              <p style={pageStyle.obrd_back_mdtxt}>{onboardStep}</p>
              <span style={pageStyle.obrd_back_smtxt}>/ 2 Steps</span>
            </h6>
          ) : null}
        </div>

        <div className="obrd_middl_main" style={pageStyle.obrd_middl_main}>
          {onboardStep == 1 ? (
            <div className="obrd_middl_wrp" style={pageStyle.obrd_middl_wrp}>
              <div
                className="obrd_middl_ImgWrp"
                style={pageStyle.obrd_middl_ImgWrp}
              >
                <ImageComponent
                  styles={pageStyle.obrd_middl_tpImg}
                  imgPic={obrd_middl_tpImg1}
                  alt="obrd_middl_tpImg"
                />
                {/* <p>{telegraminitData ? telegraminitData : 'No data '}</p> */}
                <h5 style={pageStyle.obrd_middl_tphead}>Connect your Wallet</h5>
                {/* <p>{telegramId ? telegramId : "No data"}</p> */}
                <p style={pageStyle.obrd_middl_tppara}>
                  Choose a secure wallet to manage your funds
                </p>
              </div>
              {/* {Address?Address:"==================="} */}
              <pre
                style={{
                  fontSize: 10,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                  background: "#000",
                  color: "#0f0",
                  padding: 8,
                  textAlign: "center",
                }}
              >
                {/* {window.Telegram?.WebApp?.initData || "NO INITDATA"}  */}
              </pre>
              <h5
                className="obrd_middl_cntrPara"
                style={pageStyle.obrd_middl_cntrPara}
              >
                <RiShieldCheckFill style={pageStyle.obrd_middl_cntpricon} />{" "}
                Smart Contract Protection
              </h5>
              {/* <button onClick={() => }>
        Connect Ethereum (MetaMask)
      </button>
<div className="wallet-card">
        <p>Connected: <b>{address?.slice(0, 6)}...{address?.slice(-4)}</b></p>
        <p>Balance: {balance?.formatted} {balance?.symbol}</p>
        <button onClick={() => disconnect()} className="btn-secondary">
          Disconnect
        </button>
      </div> */}
              {/* <WalletMultiButton /> */}
              {/* {window.Telegram?.WebApp?.initData  ?window.Telegram?.WebApp?.initData :"intidd"}
          {telegramUser?.telegramId  ?telegramUser.telegramId:"telegramUser.telegramId" }
          {teleId?teleId:"teleId"} */}
              {/* Reconnect to existing custodial wallet — shown when user has a previously created wallet */}
              {custodialWallets.length > 0 && !walletaccess && (
                <div style={{ marginBottom: 16 }}>
                  <p
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.5)",
                      marginBottom: 8,
                      textAlign: "center",
                    }}
                  >
                    You have an existing wallet
                  </p>
                  {custodialWallets.map((w, i) => (
                    <div
                      key={i}
                      className="obrd_wllet_itm"
                      style={{
                        ...pageStyle.obrd_wllet_itm,
                        borderColor: "rgba(99,102,241,0.5)",
                        background: "rgba(99,102,241,0.08)",
                        marginBottom: 8,
                      }}
                      onClick={reconnectCustodialWallet}
                    >
                      <ImageComponent
                        styles={pageStyle.obrd_wllet_img}
                        imgPic={walletIMG}
                        alt="own_wallet"
                      />
                      <div className="obrd_wllet_itmcnt">
                        <h6 style={pageStyle.obrd_wllet_head}>
                          My {w.network} Wallet
                        </h6>
                        <p
                          style={{ ...pageStyle.obrd_wllet_para, fontSize: 11 }}
                        >
                          {w.address.slice(0, 8)}...{w.address.slice(-6)}
                        </p>
                      </div>
                      <GoArrowRight style={pageStyle.obrd_wllet_icon} />
                    </div>
                  ))}
                  <div
                    style={{
                      textAlign: "center",
                      fontSize: 11,
                      color: "rgba(255,255,255,0.3)",
                      marginTop: 8,
                      marginBottom: 4,
                    }}
                  >
                    — or connect a different wallet —
                  </div>
                </div>
              )}

              <div className="obrd_wllet_wrp" style={pageStyle.obrd_wllet_wrp}>
                {walletData.map((item, index) => {
                  const isLoading = walletLoading === item.keys; // only true for the clicked wallet
                  const isConnecteds = wallet?.name === item.keys;
                  console.log(isConnected, Address, walletaccess, "ssdsad");
                  return (
                    <div
                      key={index}
                      className="obrd_wllet_itm"
                      style={pageStyle.obrd_wllet_itm}
                      onClick={() => connectWallet(item.keys)}
                    >
                      <ImageComponent
                        styles={pageStyle.obrd_wllet_img}
                        imgPic={item.img}
                        alt="obrd_middl_wllImg"
                      />
                      <div className="obrd_wllet_itmcnt">
                        {/* <h6 style={pageStyle.obrd_wllet_head}>
                          {item.heading}
                          {walletName &&
                          normalizeWalletName(walletName) ==
                            normalizeWalletName(item.keys) &&
                          // Address ||address || isConnected &&
                          walletaccess ? (
                            <span style={pageStyle.obrd_wllet_headSpan}>
                              Connected
                              {/* <p>
                                {walletName} {item.keys}
                              </p> */}
                        {/* </span>
                          ) : (
                            ""
                          )}
                        </h6> */}
                        <h6 style={pageStyle.obrd_wllet_head}>
                          {item.heading}
                          {/* {userWallet.isConnected }
  {normalizeWalletName(userWallet.walletName) }
  {normalizeWalletName(item.keys) }
  {walletName } */}

                          {(walletName &&
                            normalizeWalletName(walletName) ===
                              normalizeWalletName(item.keys) &&
                            walletaccess) ||
                          (userWallet.isConnected &&
                            normalizeWalletName(userWallet.walletName) ===
                              normalizeWalletName(item.keys)) ? (
                            <span style={pageStyle.obrd_wllet_headSpan}>
                              Connected
                            </span>
                          ) : (
                            ""
                          )}
                        </h6>

                        <p style={pageStyle.obrd_wllet_para}>
                          {item.description}
                        </p>
                        {isLoading && loadstatus ? (
                          <FaSpinner className="rotating-spinner" />
                        ) : //   <i className="fa-solid fa-spinner fa-spin"></i>
                        !isConnecteds ? (
                          <GoArrowRight style={pageStyle.obrd_wllet_icon} />
                        ) : (
                          <GoArrowRight style={pageStyle.obrd_wllet_icon} />
                        )}

                        {/* { ?
                        <i class="fa-solid fa-spinner fa-spin"></i>
                        // <FaSpinner />
                        :
                        wallet?.name != item.keys && (
                          <GoArrowRight style={pageStyle.obrd_wllet_icon} />
                        )
                        } */}
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* {`phantom address ${Address}`} 
             <button onClick={connectPhantomnew}>Connect wallet</button>
              <button onClick={connectSolflaremnew}>Solflare wallet</button>
              {/* {isConnected || Address && walletaccess ?( */}

              {!loadingwallet && (
                <>
                  {/* Chain toggle — shown after managed wallet connects */}
                  {walletName === "newwallet" && walletaccess && (bothWallets.arb || bothWallets.sol) && (
                    <div style={{ display: "flex", gap: 8, margin: "12px 0", width: "100%" }}>
                      {["ARB", "SOL"].map((c) => (
                        <button
                          key={c}
                          onClick={() => {
                            switchChain(c);
                            const w = bothWallets?.[c.toLowerCase()];
                            if (w?.address) {
                              setAddress(w.address);
                              localStorage.setItem("walletAddress", w.address);
                            }
                          }}
                          style={{
                            flex: 1,
                            padding: "10px 0",
                            borderRadius: 8,
                            border: "none",
                            cursor: "pointer",
                            background: activeChain === c ? "#6366f1" : "rgba(255,255,255,0.08)",
                            color: "#fff",
                            fontWeight: activeChain === c ? 700 : 400,
                            fontSize: 13,
                          }}
                        >
                          {c === "ARB" ? "Arbitrum (ARB)" : "Solana (SOL)"}
                        </button>
                      ))}
                    </div>
                  )}

                  {((Address && walletaccess) || userWallet.isConnected) && (
                    <button
                      className="onbord_subtbtn"
                      style={pageStyle.onbord_subtbtn}
                      onClick={() => handleonboardStep(2)}
                    >
                      Continue
                    </button>
                  )}

                  {((Address && walletaccess) || userWallet.isConnected) && (
                    <button
                      className="onbord_subtbtn"
                      style={pageStyle.onbord_subtbtn}
                      onClick={disconnectWallet}
                    >
                      Disconnect Wallet
                    </button>
                  )}
                </>
              )}
              {/* {loadingwallet ? (
                ""
              ) : Address && walletaccess ? (
                <button
                  className="onbord_subtbtn"
                  style={pageStyle.onbord_subtbtn}
                  onClick={() => handleonboardStep(2)}
                >
                  Continue
                </button>
              ) : (
                ""
              )}
              {Address && walletaccess ? (
                <button
                  className="onbord_subtbtn"
                  style={pageStyle.onbord_subtbtn}
                  onClick={disconnectWallet}
                >
                  Disconnect Wallet
                </button>
              ) : (
                ""
              )} */}
            </div>
          ) : onboardStep === 2 ? (
            <div className="obrd_middl_wrp" style={pageStyle.obrd_middl_wrp}>
              {/* {walletName} */}
              {walletName == "newwallet" ? (
                <>
                  <div
                    className="obrd_middl_ImgWrp obrd_middl_ImgWrpnewWllt"
                    style={pageStyle.obrd_middl_ImgWrp}
                  >
                    <ImageComponent
                      styles={pageStyle.obrd_middl_tpImg}
                      imgPic={obrd_middl_tpImg2}
                      alt="obrd_middl_tpImg"
                    />
                    <h5 style={pageStyle.obrd_middl_tphead}>
                      Fund Your Account
                    </h5>
                    <p style={pageStyle.obrd_middl_tppara}>
                      Add funds to start trading predictions
                    </p>

                    {/* ── CHANGE-6: chain toggle + QR for deposit address ── Implemented ── END CHANGE-6 ── */}
                    <h5 style={pageStyle.obrd_middl_tphead}>
                      Your Deposit Address
                    </h5>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        marginBottom: 16,
                        width: "100%",
                      }}
                    >
                      {["ARB", "SOL"].map((c) => (
                        <button
                          key={c}
                          onClick={() => {
                            switchChain(c);
                            const w = bothWallets?.[c.toLowerCase()];
                            if (w?.address) {
                              setAddress(w.address);
                              localStorage.setItem("walletAddress", w.address);
                            }
                          }}
                          style={{
                            flex: 1,
                            padding: "10px 0",
                            borderRadius: 8,
                            border: "none",
                            cursor: "pointer",
                            background:
                              activeChain === c
                                ? "#6366f1"
                                : "rgba(255,255,255,0.08)",
                            color: "#fff",
                            fontWeight: activeChain === c ? 700 : 400,
                            fontSize: 13,
                          }}
                        >
                          {c === "ARB" ? "Arbitrum (ARB)" : "Solana (SOL)"}
                        </button>
                      ))}
                    </div>

                    <ImageComponent
                      styles={pageStyle.obrd_middl_tpImg}
                      // imgPic={`https://quickchart.io/chart?chs=168x168&chld=M|0&cht=qr&chl=${Address}`}
                      // alt="obrd_middl_tpImg"
                      imgPic={`https://quickchart.io/chart?chs=168x168&chld=M|0&cht=qr&chl=${encodeURIComponent(Address)}`}
                      className="qrcodeBox"
                    />
                    <div className="obrd_mdl_InptWrp">
                      <div
                        className="obrd_mdl_Inpt"
                        style={pageStyle.obrd_mdl_Inpt}
                      >
                        <input
                          type="text"
                          name="depositAmount"
                          value={Address ? `${Address.slice(0, 8)}...` : ""}
                          style={pageStyle.obrd_mdl_InptFld}
                        />
                        <FaCopy onClick={() => copyAddress()}></FaCopy>
                      </div>
                    </div>
                    <div className="obrd_mdl_InptWrp m-2">
                      <button
                        className="onbord_emptytbtn"
                        style={pageStyle.onbord_emptytbtn}
                        onClick={() => navigate("/markets")}
                      >
                        Continue to App
                      </button>
                    </div>
                  </div>
                  <div></div>
                </>
              ) : (
                <>
                  <div
                    className="obrd_middl_ImgWrp"
                    style={pageStyle.obrd_middl_ImgWrp}
                  >
                    <ImageComponent
                      styles={pageStyle.obrd_middl_tpImg}
                      imgPic={obrd_middl_tpImg2}
                      alt="obrd_middl_tpImg"
                    />
                    <h5 style={pageStyle.obrd_middl_tphead}>
                      Fund Your Account
                    </h5>
                    <p style={pageStyle.obrd_middl_tppara}>
                      Add funds to start trading predictions
                    </p>
                  </div>
                  <div
                    className="obrd_mdl_InptMain"
                    style={pageStyle.obrd_mdl_InptMain}
                  >
                    <div className="obrd_mdl_InptWrp">
                      <label style={pageStyle.obrd_mdl_Inplbl}>
                        Choose Currency
                      </label>
                      <Select
                        options={currencyList}
                        styles={customStyles}
                        style={pageStyle.obrd_mdl_Inpt}
                        className="obrd_mdl_Inpt_select text-white"
                        onChange={(value) => chooseCurrency(value)}
                      />
                      <p
                        style={pageStyle.obrd_mdl_InpMin}
                        className="obrd_mdl_InpMin"
                      >
                        Availble Balance:
                        {/* {selectedCurrencySymbolref.current == "SOL"
                      ? Number(solBalanceref.current).toFixed(6)
                      : selectedCurrencySymbolref.current == "USDT"
                      ? Number(UsdtBalanceref.current).toFixed(6) */}
                        {/* : */}
                        {Number(UsdtBalanceref.current).toFixed(6)}
                      </p>
                    </div>
                    {validate ? (
                      <p className="validate" translate="yes">
                        {validationCurrencymsg}
                      </p>
                    ) : (
                      ""
                    )}
                    <div className="obrd_mdl_InptWrp">
                      <label style={pageStyle.obrd_mdl_Inplbl}>
                        Deposit Amount
                      </label>
                      <div
                        className="obrd_mdl_Inpt"
                        style={pageStyle.obrd_mdl_Inpt}
                      >
                        <span style={pageStyle.obrd_mdl_Inpsybl}>$</span>
                        <input
                          type="number"
                          placeholder="0"
                          name="depositAmount"
                          value={depositAmountref.current}
                          onChange={handleChange}
                          autoComplete="off"
                          translate="no"
                          min="0"
                          onKeyDown={(e) => {
                            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                              e.preventDefault();
                            }
                          }}
                          style={pageStyle.obrd_mdl_InptFld}
                        />
                      </div>

                      {validate ? (
                        <p className="validate" translate="yes">
                          {validationmsg}
                        </p>
                      ) : (
                        ""
                      )}
                      <p
                        style={pageStyle.obrd_mdl_InpMin}
                        className="obrd_mdl_InpMin"
                      >
                        Minimum deposit:0.000001
                        {/* Minimum deposit:{DepositLimit ? DepositLimit : "0"} */}
                      </p>
                    </div>

                    <div
                      style={pageStyle.obrd_mdl_amunWrp}
                      className="obrd_mdl_amunWrp"
                    >
                      <div
                        className="obrd_mdl_amunItm"
                        style={pageStyle.obrd_mdl_amunItm}
                        onClick={() => {
                          setdepositAmount(50);
                        }}
                      >
                        $50
                      </div>
                      <div
                        className="obrd_mdl_amunItm"
                        style={pageStyle.obrd_mdl_amunItm}
                        onClick={() => {
                          setdepositAmount(100);
                        }}
                      >
                        $100
                      </div>
                      <div
                        className="obrd_mdl_amunItm"
                        style={pageStyle.obrd_mdl_amunItm}
                        onClick={() => {
                          setdepositAmount(150);
                        }}
                      >
                        $250
                      </div>
                      <div
                        className="obrd_mdl_amunItm"
                        style={pageStyle.obrd_mdl_amunItm}
                        onClick={() => {
                          setdepositAmount(250);
                        }}
                      >
                        $500
                      </div>
                    </div>
                  </div>
                  {depositLoader == true ? (
                    <button
                      className="onbord_subtbtn"
                      style={pageStyle.onbord_subtbtn}
                    >
                      Loading...
                    </button>
                  ) : walletName == "metamask" ? (
                    <button
                      className="onbord_subtbtn"
                      style={pageStyle.onbord_subtbtn}
                      // onClick={() => handleonboardStep(3)}
                      onClick={handleEvmTransfer}
                    >
                      Deposit $ {depositAmountref.current}
                    </button>
                  ) : (
                    <button
                      className="onbord_subtbtn"
                      style={pageStyle.onbord_subtbtn}
                      // onClick={() => handleonboardStep(3)}
                      // onClick={() => deposit()}
                      onClick={sendusdcfn}
                    >
                      Deposit $ {depositAmountref.current}
                    </button>
                  )}
                  {/* <button >sendusdc</button> */}

                  {/* {tsdetails} */}
                  {/* <div className="flex flex-col gap-4 p-4">
      {/* <button onClick={handleEvmTransfer} className="bg-blue-500 p-2">Send Arbitrum ETH</button> */}
                  {/* <button onClick={handleSolTransfer} className="bg-purple-500 p-2">Send SOL</button>
      <button onClick={handleSplTransfer} className="bg-green-500 p-2">Send SPL USDT</button>
    </div> */}

                  <button
                    className="onbord_emptytbtn"
                    style={pageStyle.onbord_emptytbtn}
                    onClick={() => navigate("/markets")}
                  >
                    Skip for now
                  </button>
                </>
              )}
            </div>
          ) : onboardStep === 3 ? (
            <div className="obrd_middl_wrp" style={pageStyle.obrd_middl_wrp}>
              <div
                className="obrd_middl_ImgWrp"
                style={pageStyle.obrd_middl_ImgWrp}
              >
                <ImageComponent
                  styles={pageStyle.obrd_middl_tpImg}
                  imgPic={obrd_middl_tpImg3}
                  alt="obrd_middl_tpImg"
                />
                <h5 style={pageStyle.obrd_middl_tphead}>You're All Set!</h5>
                <p style={pageStyle.obrd_middl_tppara}>
                  Your account is ready to start trading predictions
                </p>
              </div>

              <div
                className="onbrd_dtlSw_wrp"
                style={pageStyle.onbrd_dtlSw_wrp}
              >
                <div
                  className="onbrd_dtlSw_itm"
                  style={pageStyle.onbrd_dtlSw_itm}
                >
                  <ImageComponent
                    styles={pageStyle.onbrd_dtlSw_img}
                    imgPic={onbrd_stp3_img1}
                    alt="onbrd_dtlSw_img"
                  />
                  <div
                    className="onbrd_dtlSw_cnt"
                    style={pageStyle.onbrd_dtlSw_cnt}
                  >
                    <label style={pageStyle.onbrd_dtlSw_lbl}>User Name</label>
                    <h6 style={pageStyle.onbrd_dtlSw_val}>Jon Snow</h6>
                  </div>
                </div>
                <div
                  className="onbrd_dtlSw_itm"
                  style={pageStyle.onbrd_dtlSw_itm}
                >
                  <ImageComponent
                    styles={pageStyle.onbrd_dtlSw_img}
                    imgPic={onbrd_stp3_img2}
                    alt="onbrd_dtlSw_img"
                  />
                  <div
                    className="onbrd_dtlSw_cnt"
                    style={pageStyle.onbrd_dtlSw_cnt}
                  >
                    <label style={pageStyle.onbrd_dtlSw_lbl}>
                      Wallet Address
                    </label>
                    <h6 style={pageStyle.onbrd_dtlSw_val}>
                      {Address ? Address : ""}
                    </h6>

                    {/* <h6 style={pageStyle.onbrd_dtlSw_val}>0x015f...</h6> */}
                  </div>
                </div>
                <div
                  className="onbrd_dtlSw_itm"
                  style={pageStyle.onbrd_dtlSw_itm}
                >
                  <ImageComponent
                    styles={pageStyle.onbrd_dtlSw_img}
                    imgPic={onbrd_stp3_img3}
                    alt="onbrd_dtlSw_img"
                  />
                  <div
                    className="onbrd_dtlSw_cnt onbrd_dtlSwAccnt_cnt"
                    style={pageStyle.onbrd_dtlSw_cnt}
                  >
                    <label style={pageStyle.onbrd_dtlSw_lbl}>
                      Account Balance
                    </label>
                    <h6 style={pageStyle.onbrd_dtlSw_val}>$100.00</h6>
                  </div>
                </div>
              </div>

              <button
                className="onbord_subtbtn"
                style={pageStyle.onbord_subtbtn}
                onClick={handleNavigate}
              >
                <ImageComponent
                  styles={pageStyle.onbord_subtbtn_img}
                  imgPic={mdi_stars_icon}
                  alt="onbrd_dtlSw_img"
                />
                Start Trading Now
              </button>
              <p
                className="onbrd_dtl_btmcnt"
                style={pageStyle.onbrd_dtl_btmcnt}
              >
                Welcome to the future of prediction markets! 🚀
              </p>
            </div>
          ) : null}
          {/* <button onClick={sendusdcfn}>sendusdc</button> */}
        </div>
      </div>
      {/* <Modal
        open={ChoosewalletStatus}
        onClose={() => setChoosewalletStatus(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={style}
          className="bot_modal_box bot_modal_boxnew mdlChosNtwk "
          style={pageStyle2.bot_modal_box}
        >
          {walletName == "newwallet" && !walletLoad ? (
            <>
              {" "}
              <label
                className="mdlChosNtwk_Lbl"
                style={pageStyle.mdlChosNtwk_Lbl}
              >
                Choose Network
              </label>
              <Select
                options={options}
                styles={customStyles}
                style={pageStyle.obrd_mdl_Inpt}
                className="obrd_mdl_Inpt_select text-white mdlChosNtwkSlect"
                onChange={(value) => {
                  (setSelectNetwork(value), createNewWalletFunc(value));
                }}
              />
            </>
          ) : (
            <div className="mt-2 text-sm text-gray-400">Creating wallet...</div>
          )}
        </Box>
      </Modal> */}
      {/* ── CHANGE-7: Network chooser modal removal — system now auto-creates both ARB+SOL wallets ── implemented
      Replace the Modal above with: nothing (remove it entirely when uncommenting CHANGE-5)
      ── END CHANGE-7 ── */}
      <Modal
        open={false}
        onClose={() => setshowOtpBox(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={style}
          className="bot_modal_box bot_modal_boxnew copy_vrfyCde_Box "
          style={pageStyle2.bot_modal_box}
        >
          <div className="obrd_mdl_Inpt" style={pageStyle.obrd_mdl_Inpt}>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength="6"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={handleOtpChange}
              autoComplete="one-time-code"
              // style={{
              //   width: '100%',
              //   height: '50px',
              //   textAlign: 'center',
              //   fontSize: '24px',
              //   letterSpacing: '8px',
              //   border: error ? '2px solid #ff4444' : '2px solid #ccc',
              //   borderRadius: '8px',
              //   outline: 'none',
              //   padding: '0 20px'
              // }}
            />
          </div>
          {error && (
            <p
              style={{ color: "#ff4444", fontSize: "14px", marginTop: "10px" }}
            >
              {error}
            </p>
          )}

          <button
            className="onbord_subtbtn mdlvrfyCdBtn m-2"
            onClick={verifyOTP}
            disabled={verifyOtpLoader}
          >
            {verifyOtpLoader ? "Verifying..." : "Verify Code"}
          </button>

          <div style={{ marginTop: "20px" }}>
            {timer > 0 ? (
              <p className="mdlvrfyRsndCde">
                Resend code in <span>{timer}s</span>
              </p>
            ) : (
              <p
                className="mdlvrfyRsndCde"
                onClick={resend_otp}
                disabled={resendOtpLoader}
              >
                {resendOtpLoader ? "Sending..." : "Resend Code"}
              </p>
            )}
          </div>
        </Box>
      </Modal>
      <Modal
        open={false}
        onClose={() => setshowprivateBox(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={style}
          className="bot_modal_box bot_modal_boxnew copy_number_Box"
          style={pageStyle2.bot_modal_box}
        >
          <p
            style={pageStyle.copy_number_WrnTxt}
            className="copy_number_WrnTxt"
          >
            Warning <LuInfo className="copy_num_icon" />
          </p>
          <p
            style={pageStyle.copy_number_WrnTxt}
            className="copy_number_WrnTxt2"
          >
            Do not share it with anyone. If someone gets access to this key,
            they can fully control your wallet and assets.
          </p>
          <div
            className="obrd_mdl_Inpt copy_numb_inpt"
            style={pageStyle.obrd_mdl_Inpt}
          >
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength="6"
              placeholder="Enter 6-digit code"
              value={privateKey}
            />
            <FaCopy onClick={() => copyPrivateKey()}> </FaCopy>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

const pageStyle2 = {
  mrkt_dtl_wrp: {
    padding: `${moderateScale(20)}px ${moderateScale(20)}px ${moderateScale(110)}px `,
  },
  obrd_back_wrp: {
    marginBottom: `${moderateScale(16)}px`,
  },
  homt_tab_Countitmnewone: {
    marginBottom: `${moderateScale(10)}px`,
  },
  both_andtagleftmain: {
    marginTop: `${moderateScale(24)}px`,
  },
  about_detailssecmainhead: {
    marginBottom: `${moderateScale(24)}px`,
  },
  backgrdset_foryesnoneone: {
    gap: `${moderateScale(16)}px`,
    marginBottom: `${moderateScale(23)}px`,
    padding: `${moderateScale(12)}px ${moderateScale(12)}px ${moderateScale(24)}px`,
  },
  main_marketdetailsdiv: {
    paddingBottom: `${moderateScale(30)}px`,
  },
  market_detailsundertab: {
    marginTop: `${moderateScale(20)}px`,
    gap: `${moderateScale(3)}px`,
  },
  hrs_calculationmaintag: {
    gap: `${moderateScale(8)}px`,
  },
  homt_tab_CountHednewoneneone: {
    gap: `${moderateScale(7)}px`,
  },
  bot_modal_box: {
    width: `${moderateScale(345)}px`,
    height: `${moderateScale(567)}px`,
    padding: `${moderateScale(16)}px ${moderateScale(16)}px ${moderateScale(24)}px`,
  },
  home_tab_leftimg: {
    width: `${moderateScale(50)}px`,
    height: `${moderateScale(50)}px`,
    borderRadius: `${moderateScale(50)}%`,
  },
  homt_tab_Countimgnewoneliq: {
    width: `${moderateScale(20)}px`,
    height: `${moderateScale(20)}px`,
  },
  price_detailsinside: {
    // margin: `${moderateScale(12)}px ${moderateScale(0)}px ${moderateScale(12)}px ${moderateScale(0)}px` ,
    gap: `${moderateScale(8)}px`,
  },

  obrd_back_txt: {
    fontSize: `${moderateScale(16)}px`,
  },
  hrs_calculationheadtwo: {
    fontSize: `${moderateScale(12)}px`,
  },
  home_tab_headonenew: {
    fontSize: `${moderateScale(14)}px`,
    maxWidth: `${moderateScale(136)}px`,
  },
  about_detailssechead: {
    fontSize: `${moderateScale(14)}px`,
  },
  image_and_headernew: {
    gap: `${moderateScale(16)}px`,
    marginBottom: `${moderateScale(16)}px`,
  },
  hrs_calculationheadone: {
    fontSize: `${moderateScale(16)}px`,
  },
  crypto_manualinsidesecsix: {
    fontSize: `${moderateScale(12)}px`,
  },
  crypto_manualinsidefirstsix: {
    fontSize: `${moderateScale(12)}px`,
  },
  homt_tab_CountParaneoene: {
    fontSize: `${moderateScale(12)}px`,
  },
  yesno_detailsyesnewone: {
    fontSize: `${moderateScale(12)}px`,
  },
  yesno_detailsnoone: {
    fontSize: `${moderateScale(16)}px`,
  },
  btn_yesandnobtnfive: {
    fontSize: `${moderateScale(14)}px`,
  },
  bottom_section: {
    padding: `${moderateScale(28)}px ${moderateScale(20)}px ${moderateScale(23)}px`,
  },
  yesno_detailsyes: {
    fontSize: `${moderateScale(16)}px`,
  },
  yesno_detailsno: {
    fontSize: `${moderateScale(16)}px`,
  },
  timer_leftsix: {
    fontSize: `${moderateScale(13.9)}px`,
  },
  about_detailssecpara: {
    fontSize: `${moderateScale(12)}px`,
  },
  disclainmer_details: {
    fontSize: `${moderateScale(12)}px`,
    margin: `${moderateScale(17)}px ${moderateScale(0)}px ${moderateScale(0)}px ${moderateScale(0)}px`,
  },
  obrd_back_txt2: {
    fontSize: `${moderateScale(20)}px`,
  },
  alert_Span: {
    fontSize: `${moderateScale(20)}px`,
  },
  curnt_fund_prgsLinespan: {
    width: `${moderateScale(75)}%`,
    height: `${moderateScale(11)}px`,
  },

  crypto_manualdiv: {
    padding: `${moderateScale(16)}px ${moderateScale(0)}px ${moderateScale(0)}px`,
  },
  btn_yesandnobtn1: {
    padding: `${moderateScale(10)}px `,
  },
  btn_yesandnobtn2: {
    padding: `${moderateScale(10)}px `,
  },
  backgrdset_foryesno: {
    padding: `${moderateScale(12)}px ${moderateScale(12)}px ${moderateScale(24)}px`,
    gap: `${moderateScale(16)}px`,
  },
  price_detailssec: {
    padding: `${moderateScale(16)}px`,
    marginTop: `${moderateScale(24)}px`,
    marginBottom: `${moderateScale(16)}px`,
  },
  crypto_manualinsidediv: {
    gap: `${moderateScale(7)}px`,
  },
  total_poolimg: {
    width: `${moderateScale(21)}px`,
    height: `${moderateScale(21)}px`,
  },
  pool_userlistdiv: {
    gap: `${moderateScale(5)}px`,
  },
  crypto_manualinsidesecspan: {
    gap: `${moderateScale(4)}px`,
    padding: `${moderateScale(6)}px ${moderateScale(10)}px`,
  },
  crypto_manualinsidefirstspan: {
    gap: `${moderateScale(4)}px`,
    padding: `${moderateScale(6)}px ${moderateScale(10)}px`,
  },
  pool_userlistdivCnt: {
    fontSize: `${moderateScale(13.9)}px`,
  },
  btc_marketdetails: {
    fontSize: `${moderateScale(16)}px`,
  },
  btc_marketdetailspaara: {
    fontSize: `${moderateScale(14)}px`,
  },
};
const pageStyle = {
  obrd_back_wrp: {
    marginBottom: `${moderateScale(15)}px`,
  },
  obrd_back_txt: {
    fontSize: `${moderateScale(16)}px`,
  },
  obrd_back_txt2: {
    fontSize: `${moderateScale(20)}px`,
  },
  obrd_back_mdtxt: {
    fontSize: `${moderateScale(24)}px`,
  },
  obrd_back_smtxt: {
    fontSize: `${moderateScale(14)}px`,
  },
  obrd_middl_main: {
    marginTop: `${moderateScale(0)}px`,
  },
  obrd_middl_ImgWrp: {
    marginBottom: `${moderateScale(24)}px`,
  },
  obrd_middl_tpImg: {
    width: `${moderateScale(75)}px`,
    height: `${moderateScale(75)}px`,
  },
  obrd_middl_tphead: {
    fontSize: `${moderateScale(18)}px`,
  },
  obrd_middl_tppara: {
    fontSize: `${moderateScale(14)}px`,
  },
  obrd_middl_cntrPara: {
    fontSize: `${moderateScale(12)}px`,
  },
  obrd_middl_cntpricon: {
    fontSize: `${moderateScale(18)}px`,
  },
  onbord_subtbtn: {
    fontSize: `${moderateScale(14)}px`,
    marginTop: `${moderateScale(0)}px`,
    marginBottom: `${moderateScale(8)}px`,
    gap: `${moderateScale(10)}px`,
    padding: `${moderateScale(15)}px ${moderateScale(10)}px`,
  },
  obrd_wllet_wrp: {
    marginTop: `${moderateScale(25)}px`,
    marginBottom: `${moderateScale(50)}px`,
    gap: `${moderateScale(16)}px`,
  },
  obrd_wllet_itm: {
    gap: `${moderateScale(10)}px`,
    padding: `${moderateScale(16)}px ${moderateScale(16)}px`,
  },
  obrd_wllet_img: {
    width: `${moderateScale(38)}px`,
    height: `${moderateScale(38)}px`,
  },
  obrd_wllet_head: {
    fontSize: `${moderateScale(14)}px`,
    marginBottom: `${moderateScale(5)}px`,
    gap: `${moderateScale(6)}px`,
  },
  obrd_wllet_headSpan: {
    fontSize: `${moderateScale(12)}px`,
    padding: `${moderateScale(2)}px ${moderateScale(10)}px`,
  },
  obrd_wllet_para: {
    fontSize: `${moderateScale(12)}px`,
    maxWidth: `${moderateScale(180)}px`,
  },
  obrd_wllet_icon: {
    fontSize: `${moderateScale(20)}px`,
  },
  obrd_mdl_InptMain: {
    padding: `${moderateScale(16)}px ${moderateScale(22)}px ${moderateScale(
      19,
    )}px ${moderateScale(14)}px`,
    gap: `${moderateScale(28)}px`,
    marginBottom: `${moderateScale(90)}px`,
  },
  obrd_mdl_Inplbl: {
    fontSize: `${moderateScale(14)}px`,
    marginBottom: `${moderateScale(20)}px`,
  },
  mdlChosNtwk_Lbl: {
    fontSize: `${moderateScale(16)}px`,
    marginBottom: `${moderateScale(20)}px`,
  },
  obrd_mdl_Inpt: {
    padding: `${moderateScale(11)}px ${moderateScale(12)}px ${moderateScale(
      12,
    )}px ${moderateScale(12)}px`,
    gap: `${moderateScale(10)}px`,
  },
  obrd_mdl_Inpsybl: {
    fontSize: `${moderateScale(20)}px`,
  },
  obrd_mdl_InptFld: {
    fontSize: `${moderateScale(16)}px`,
  },
  obrd_mdl_InpMin: {
    fontSize: `${moderateScale(12)}px`,
    marginTop: `${moderateScale(7)}px`,
  },
  obrd_mdl_amunWrp: {
    gap: `${moderateScale(12)}px`,
  },
  obrd_mdl_amunItm: {
    padding: `${moderateScale(10)}px ${moderateScale(5)}px `,
    fontSize: `${moderateScale(14)}px`,
  },
  onbord_emptytbtn: {
    fontSize: `${moderateScale(14)}px`,
    marginTop: `${moderateScale(0)}px`,
    marginBottom: `${moderateScale(8)}px`,
    gap: `${moderateScale(10)}px`,
    padding: `${moderateScale(15)}px ${moderateScale(10)}px`,
  },
  onbrd_dtlSw_wrp: {
    gap: `${moderateScale(16)}px`,
    marginBottom: `${moderateScale(100)}px`,
  },
  onbrd_dtlSw_itm: {
    gap: `${moderateScale(16)}px`,
    padding: `${moderateScale(16)}px ${moderateScale(18)}px`,
  },
  onbrd_dtlSw_img: {
    width: `${moderateScale(35)}px`,
    height: `${moderateScale(35)}px`,
  },
  onbrd_dtlSw_lbl: {
    fontSize: `${moderateScale(12)}px`,
    marginBottom: `${moderateScale(5)}px`,
  },
  onbrd_dtlSw_val: {
    fontSize: `${moderateScale(14)}px`,
  },
  onbord_subtbtn_img: {
    width: `${moderateScale(24)}px`,
    height: `${moderateScale(24)}px`,
  },
  onbrd_dtl_btmcnt: {
    fontSize: `${moderateScale(10)}px`,
    marginTop: `${moderateScale(8)}px`,
  },
  copy_number_WrnTxt: {
    fontSize: `${moderateScale(17)}px`,
  },
};

export default Onboarding;
