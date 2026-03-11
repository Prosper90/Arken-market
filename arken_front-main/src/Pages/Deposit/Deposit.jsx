import React, { useEffect } from "react";
import "./Deposit.css";
import useState from "react-usestateref";
import { moderateScale } from "../../utils/Scale";
import ImageComponent from "../../Components/ImageComponent";
import { useNavigate } from "react-router-dom";
import total_pool from "../../assets/image/total_pool.webp";
import Withdraw_img from "../../assets/image/Withdraw.png";
import Deposit_img from "../../assets/image/Deposit.png";
import { MdOutlineArrowBackIosNew } from "react-icons/md";
import { RiShieldCheckFill } from "react-icons/ri";
import wllt_top_img from "../../assets/image/wllt_top_img.webp";
import EthereumProvider from "@walletconnect/ethereum-provider";
import { ethers } from "ethers";
import { BrowserProvider, JsonRpcProvider, Contract, parseUnits } from "ethers";
import Box from "@mui/material/Box";
import homt_tab_Countimg1 from "../../assets/image/homt_tab_Countimg1.webp";
import { env } from "../../core/sevice/envconfig";
import { getSolanaConnectionWithBlockhash, getSolanaConnection } from "../../utils/solanaConnection";
import * as web3 from "@solana/web3.js";
import bs58 from "bs58";
import nacl from "tweetnacl";

import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  Transaction,
} from "@solana/web3.js";

import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  createTransferCheckedInstruction,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

import Modal from "@mui/material/Modal";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { CiClock2 } from "react-icons/ci";
import { useSendTransaction } from 'wagmi';

import { GoArrowRight } from "react-icons/go";
import { IoAlertCircleOutline, IoCalendarOutline } from "react-icons/io5";
import { TbUsers } from "react-icons/tb";
import { IoIosTimer } from "react-icons/io";
import Buyform from "../Buyform";
import { parseEther } from 'viem';
import { getMethod, postMethod } from "../../core/sevice/common.api";
import apiService from "../../core/sevice/detail";
import { useTelegramUser } from "../../context/TelegramUserContext";
import BottomTab from "../BottomTab/BottomTab";
// import nacl from "tweetnacl";

const currencies = [
  { value: "SOL - Solana", label: "SOL - Solana" },
  { value: "ETH - Ethereum", label: "ETH - Ethereum" },
  { value: "BTC - Bitcoin", label: "BTC - Bitcoin" },
  { value: "USDT - Tether", label: "USDT - Tether" },
];
const SOLANA_RPC =
  "https://mainnet.helius-rpc.com/?api-key=05031ac5-0873-42a5-bb11-1c124bb119b0";
const Deposit = () => {
  const [searchParams] = useSearchParams();
  const { telegramUser } = useTelegramUser();
  // const telegramUserID = "1453204703";
  const telegramUserID = telegramUser?.telegramId;
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("");
    const [dappKeyPair] = useState(nacl.box.keyPair());
  
  const [selectedCurrencyLabel, setSelectedCurrencyLabel] = useState("");
  const [SelectedCurrencyImage, setSelectedCurrencyImage] = useState("");
  console.log(SelectedCurrencyImage, "SelectedCurrencyImage");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [withdrawLoader, setwithdrawLoader] = useState(false);
  const [depositLoader, setdepositLoader] = useState(false);
  const [activeTab, setActiveTab] = useState("deposit");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [Address, setAddress,Addressref] = useState(localStorage.getItem("walletAddress"));
  const [depositHistory, setDepositHistory] = useState([]);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
    const { sendTransactionAsync: sendEvmTx } = useSendTransaction();

  const handleStepReduce = () => {
    navigate("/wallet");
  };
  const [addressError,setAddressError]=useState('')
  const [withdrawAddress,setWithdrawAddress]=useState('')
  const detectNetwork = (address) => {
  if (address.startsWith("0x")) return "evm";
  if (address.length >= 32 && address.length <= 44) return "solana";
  return "unknown";
};
const handleWithdrawAddress = (e) => {
  const value = e.target.value.trim();
  setWithdrawAddress(value);

  if (!value) {
    setAddressError("Address is required");
    return;
  }

  // SOLANA ADDRESS
  if (selectedCurrencyLabel === "SOL" || walletName === "phantom") {
    try {
      new PublicKey(value);
      setAddressError("");
      return;
    } catch {
      setAddressError("Invalid Solana address");
      return;
    }
  }

  // EVM ADDRESS
  if (selectedCurrencyLabel === "ARB" || walletName === "metamask") {
    if (ethers.isAddress(value)) {
      setAddressError("");
    } else {
      setAddressError("Invalid EVM wallet address");
    }
  }
};
  useEffect(() => {
    const tab = searchParams.get("tab");
    console.log(tab,"======");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    getCurrenyList();
  }, [0]);

  const [currencyList, setCurrencyList] = useState([
    { value: "sol", label: "SOL", key: "sol", depositLimit: 0 },
    { value: "usdc", label: "USDC", key: "usdc", depositLimit: 0 },
    { value: "token", label: "TOKEN", key: "token", depositLimit: 0 },
  ]);

  const getCurrenyList = async () => {
    try {
      var data = {
        apiUrl: apiService.getCurrenyList,
      };
      var resp = await getMethod(data);
      const currency = [];
      if (resp) {
for (let i = 0; i < resp.data.length; i++) {
  const opt = resp.data[i];

  if (
    walletName === "metamask" &&
    ["USDT", "SOL", "TOKEN"].includes(opt.currencySymbol)
  ) {
    continue;
  }

  if (
    walletName === "solflare" &&
    opt.currencySymbol === "ARB"
  ) {
    continue;
  }

  currency.push({
    value: opt._id,
    label: opt.currencySymbol,
    key: opt._id,
    depositLimit: opt.minDepositLimit,
    //  image: opt.Currency_image,
  });
}
        // for (let i = 0; i < resp.data.length; i++) {
        //   const opt = resp.data[i];

        //   const obj = {
        //     value: opt._id,
        //     label: opt.currencySymbol,
        //     key: opt._id,
        //     image: opt.Currency_image,
        //   };

        //   currency.push(obj);
        // }
        if (currency.length > 0) setCurrencyList(currency);
        // else: keep initial fallback [SOL, USDC, TOKEN]
      }
      // else: keep initial fallback [SOL, USDC, TOKEN]
    } catch (error) {
      console.error("Solana sign error:", error);
      throw error;
    }
  };
  const validate = (values) => {
    const errors = {};

    if (!values.currency) {
      errors.currency = "Please select a currency";
    }

    if (!values.amount) {
      errors.amount = "Amount is required";
    } else if (isNaN(values.amount) || Number(values.amount) <= 0) {
      errors.amount = "Enter a valid amount";
    }

    return errors;
  };

  const handleCurrencySelect = (value) => {
    console.log(value, "valuevalue");
    setSelectedCurrency(value.value);
    setSelectedCurrencyLabel(value.label);
    // setSelectedCurrencyImage(value.image);
    setTouched((prev) => ({ ...prev, currency: true }));
    setIsDropdownOpen(false);
    const validationErrors = validate({ currency: value, amount });
    setErrors(validationErrors);
  };

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, "").replace(/^0+(?=\d)/, '');
    setAmount(value);

    setTouched((prev) => ({ ...prev, amount: true }));

    const validationErrors = validate({
      currency: selectedCurrency,
      amount: value,
    });

    setErrors(validationErrors);
  };
  const handleIncrement = () => {
    const newAmount = Number(amount || 0) + 1;
    setAmount(newAmount.toString());
  };
  const [depositAddress, SetDepositAddress] = useState()

  const handleDecrement = () => {
    const newAmount = Math.max(Number(amount || 0) - 1, 0);
    setAmount(newAmount.toString());
  };
  const [toastId, setToastId] = useState(null);
  const showSuccessToast = (message) => {
    if (toastId) {
      toast.dismiss(toastId);
    }
    const newToastId = toast.success(message);
    setToastId(newToastId);
  };

  const showErrorToast = (message) => {
    if (toastId) {
      toast.dismiss(toastId);
    }
    const newToastId = toast.error(message);
    setToastId(newToastId);
  };

  const [teleId, setTeleId] = useState("");
  const [intiData, setintiData] = useState("");


  const copyAddress = async (address) => {
      toast.success("Wallet address copied");
      navigator.clipboard.writeText(address);
    };

  const checkTelegramId = async () => {
    
    var obj = {
      address: window.Telegram?.WebApp?.initData||localStorage.getItem("intData")||localStorage.getItem("walletAddress") || Addressref.current,
    };

    const resp = await postMethod({
      apiUrl: apiService.checkTelegramId,
      payload: obj,
    });

    setTeleId(resp.data);
    setintiData(resp.initData);
    // await authenticateTelegramUser(resp.initData);
  };

    useEffect(() => {
      getAddress();
    }, [0]);

  const [addrssLoader, setAddrssLoader] = useState(true);
  const [walletDetails, setwalletDetails] = useState({});

      const getAddress = async () => {
        try {
          setAddrssLoader(true);
          const obj = {
            wallet_name: localStorage.getItem("walletName"),
            telegramId: telegramUser?.telegramId || "5100502824",
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
            setwalletDetails(resp.WalletData);
            if (walletName == "metamask") {
              selectedWallet = resp.WalletData.find(
                (w) => w.currencySymbol === "ARB"
              );
            } else {
              selectedWallet = resp.WalletData.find(
                (w) => w.currencySymbol === "SOL"
              );
            }
          console.log(selectedWallet);
            SetDepositAddress(selectedWallet.address);
          } else {
            // showErrorToast("failed ");
          }
        } catch (err) {
          console.error(err);
          // alert(err?.shortMessage || err.message);
        }
      };

  useEffect(() => {
    checkTelegramId();
  }, []);

  const handleSubmit = async () => {
    try {
     
    const validationErrors = validate({
      currency: selectedCurrency,
      amount,
    });

    setErrors(validationErrors);
    setTouched({ currency: true, amount: true });

    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    console.log("====")
if (!withdrawAddress) {
    setAddressError("Address is required");
    return;
  } else if (selectedCurrencyLabel === "SOL" || walletName === "phantom") {
    try {
      new PublicKey(withdrawAddress);
      setAddressError("");
    } catch {
      setAddressError("Invalid Solana address");
      return;
    }
  } else if (selectedCurrencyLabel === "ARB" || walletName === "metamask") {
    if (ethers.isAddress(withdrawAddress)) {
      setAddressError("");
    } else {
      setAddressError("Invalid EVM wallet address");
      return;
    }
  }

    setwithdrawLoader(true);
    var obj = {
      currency: selectedCurrencyLabel,
      Amount: amount,
      Address: withdrawAddress,
      connectType: localStorage.getItem("walletName"),
      telegramId: teleId || telegramUser?.telegramId || localStorage.getItem("telegramId") || '5100502824',
    };
    var data = {
      apiUrl: apiService.withdraw,
      payload: obj,
    };

    var resp = await postMethod(data);
    setwithdrawLoader(false);
    if (resp.success) {
      showSuccessToast(resp.Message);
    } else {
      showErrorToast(resp.Message);
    } 
    } catch (error) {
console.log(error,"dsfdsfs")
    }
    // call your withdraw / deposit API here
  };

  // const handleIncrement = () => {
  //   const currentAmount = parseFloat(amount) || 0;
  //   setAmount((currentAmount + 1).toString());
  // };

  // const handleDecrement = () => {
  //   const currentAmount = parseFloat(amount) || 0;
  //   if (currentAmount > 0) {
  //     setAmount((currentAmount - 1).toString());
  //   }
  // };

  // const handleAmountChange = (e) => {
  //   const value = e.target.value;
  //   // Allow only numbers and decimal point
  //   if (value === "" || /^\d*\.?\d*$/.test(value)) {
  //     setAmount(value);
  //   }
  // };

  // const handleCurrencySelect = (currency) => {
  //   setSelectedCurrency(currency);
  //   setIsDropdownOpen(false);
  // };

  /// deposit

  const [validatedeposit, setvalidatedeposit] = useState(null);
  const [validationmsg, setvalidationmsg] = useState("");
  const [validationCurrencymsg, setvalidationCurrencymsg] = useState("");
  const [depositAmount, setdepositAmount, depositAmountref] = useState(0);
  const [walletName, setwalletName] = useState(
    localStorage.getItem("walletName")
  );
  const [amountUsd, setAmountUsd] = useState(null);

  useEffect(() => {
    const calculateUsd = async () => {
      if (!depositAmount || parseFloat(depositAmount) === 0 || !selectedCurrencyLabel) {
        setAmountUsd(null);
        return;
      }
      const symbolMap = { SOL: 'SOL', USDC: 'USDC', ARB: 'ARB', USDT: 'USDT' };
      const symbol = symbolMap[selectedCurrencyLabel.toUpperCase()];
      if (!symbol) { setAmountUsd(null); return; }
      try {
        const resp = await fetch(
          `https://min-api.cryptocompare.com/data/price?fsym=${symbol}&tsyms=USD`
        );
        const data = await resp.json();
        if (data && data.USD) {
          setAmountUsd((parseFloat(depositAmount) * data.USD).toFixed(2));
        } else {
          setAmountUsd(null);
        }
      } catch (e) {
        setAmountUsd(null);
      }
    };
    const timer = setTimeout(calculateUsd, 500);
    return () => clearTimeout(timer);
  }, [depositAmount, selectedCurrencyLabel]);

  // Withdrawal: current balance
  const [withdrawBalance, setWithdrawBalance] = useState(null);
  useEffect(() => {
    if (activeTab !== "withdraw") return;
    const tid = telegramUser?.telegramId || teleId || localStorage.getItem("telegramId");
    if (!tid) return;
    postMethod({ apiUrl: apiService.get_user_balance, payload: { telegramId: tid } })
      .then((resp) => {
        if (resp?.success) setWithdrawBalance(resp.totalUsdt ?? null);
      })
      .catch(() => {});
    // Fetch withdraw history
    postMethod({ apiUrl: apiService.get_withdraw_list, payload: { telegramId: tid } })
      .then((resp) => {
        if (resp?.success && Array.isArray(resp.data)) setWithdrawHistory(resp.data);
      })
      .catch(() => {});
  }, [activeTab, telegramUser?.telegramId, teleId]);

  // Withdrawal: show crypto equivalent for a USD amount
  const [withdrawCryptoEquiv, setWithdrawCryptoEquiv] = useState(null);

  useEffect(() => {
    if (activeTab !== "withdraw") return;
    const calculate = async () => {
      if (!amount || parseFloat(amount) <= 0 || !selectedCurrencyLabel) {
        setWithdrawCryptoEquiv(null);
        return;
      }
      const symbol = selectedCurrencyLabel.toUpperCase();
      // USDC is 1:1 with USD
      if (symbol === "USDC") {
        setWithdrawCryptoEquiv({ amount: parseFloat(amount).toFixed(2), symbol: "USDC" });
        return;
      }
      try {
        const resp = await fetch(
          `https://min-api.cryptocompare.com/data/price?fsym=${symbol}&tsyms=USD`
        );
        const data = await resp.json();
        if (data && data.USD && data.USD > 0) {
          setWithdrawCryptoEquiv({
            amount: (parseFloat(amount) / data.USD).toFixed(6),
            symbol,
          });
        } else {
          setWithdrawCryptoEquiv(null);
        }
      } catch {
        setWithdrawCryptoEquiv(null);
      }
    };
    const timer = setTimeout(calculate, 500);
    return () => clearTimeout(timer);
  }, [amount, selectedCurrencyLabel, activeTab]);
  const handleChange = (event) => {
    setvalidatedeposit(false);

    const sanitizedValue = event.target.value.replace(/[^\d.]/g, "");
    const regex = /^\d+(\.\d{0,6})?$/;
    if (!selectedCurrency) {
      setvalidatedeposit(true);
      setvalidationCurrencymsg("Choose currency");
    }

  if (!regex.test(event.target.value)) {
    return;
  }

    if (
      event.target.value === "0000000000" ||
      event.target.value === "0.00000000" ||
      event.target.value.length === 11
    ) {
      event.target.value = 0;
      setvalidationmsg("Enter valid Amount");
      setvalidatedeposit(true);
    }

    if (
      event.target.value.length === "00.0" ||
      event.target.value.length === "000.0" ||
      event.target.value.length === "0000.0"
    ) {
      event.target.value = 0;
      setvalidatedeposit(true);
      setvalidationmsg("Enter valid Amount");
    }

    if (sanitizedValue.length < 11) {
      const noLeadingZeros = sanitizedValue.replace(/^0+(?=\d)/, '');
      setdepositAmount(noLeadingZeros);
    }
  };

  const depositCurrency = async () => {
    try {
      if (!selectedCurrency) {
        setvalidatedeposit(true);
        setvalidationCurrencymsg("Choose currency");
        return;
      } else {
        setvalidatedeposit(false);
        setvalidationCurrencymsg("");
      }

      if (!depositAmountref.current) {
        setvalidatedeposit(true);
        setvalidationmsg("Enter Amount");
        return;
      } else {
        setvalidatedeposit(false);
        setvalidationmsg("");
      }
      setdepositLoader(true);
      if (walletName == "solflare") {
        const wallet = window.solflare;

        await wallet.connect();

        const { connection, blockhash } = await getSolanaConnectionWithBlockhash("confirmed");

        const lamports =
          Number(depositAmountref.current) * web3.LAMPORTS_PER_SOL;

        // 2. Create Transaction
        const transaction = new web3.Transaction().add(
          web3.SystemProgram.transfer({
            fromPubkey: wallet.publicKey, // Use the public key from the SDK
            toPubkey: new web3.PublicKey(env.Admin_wallet),
            lamports: lamports,
          })
        );

        transaction.recentBlockhash = blockhash;
        transaction.feePayer = wallet.publicKey;

        // 3. Sign and Send in one step
        const signature = await wallet.signAndSendTransaction(transaction);
        console.log("Tx hash:", signature);
        setdepositLoader(true);
        if (signature) {
          const obj = {
            walletAddress: Address,
            WaletName: localStorage.getItem("walletName"),
            depositAmount: depositAmountref.current,
            telegramId: teleId || localStorage.getItem("telegramId"),
            // transactionHash: signature,
            hash: signature,
            currency: selectedCurrency,
            currencySymbol: selectedCurrencyLabel,
          };
          var data = {
            apiUrl: apiService.transferToken,
            payload: obj,
          };
          var resp = await postMethod(data);
          setdepositLoader(false);
          if (resp.success) {
            showSuccessToast(resp.message);
          } else {
            showErrorToast("Transaction failed, please try again");
          }
        }
      } else {
        try {
          if (!selectedCurrency) {
            setvalidatedeposit(true);
            setvalidationCurrencymsg("Choose currency");
            return;
          }

          if (!depositAmountref.current) {
            setvalidatedeposit(true);
            setvalidationmsg("Enter Amount");
            return;
          }

          // Phantom deep link for SOL (window.solana not available in Telegram)
          if (!phantomSession || !phantomSession.session || !phantomSession.sharedSecret) {
            showErrorToast("Phantom session not found. Please reconnect your wallet.");
            setdepositLoader(false);
            return;
          }

          const { connection, blockhash } = await getSolanaConnectionWithBlockhash("confirmed");
          const fromPublicKey = new web3.PublicKey(Address);
          const toPublicKey = new web3.PublicKey(env.Admin_wallet);
          const lamports = Number(depositAmountref.current) * web3.LAMPORTS_PER_SOL;
          const transaction = new web3.Transaction({
            recentBlockhash: blockhash,
            feePayer: fromPublicKey,
          }).add(
            web3.SystemProgram.transfer({
              fromPubkey: fromPublicKey,
              toPubkey: toPublicKey,
              lamports,
            })
          );

          const serializedTx = transaction.serialize({
            requireAllSignatures: false,
            verifySignatures: false,
          });
          const nonce = nacl.randomBytes(24);
          const payload = {
            transaction: bs58.encode(serializedTx),
            session: phantomSession.session,
          };
          const encrypted = nacl.box.after(
            new TextEncoder().encode(JSON.stringify(payload)),
            nonce,
            phantomSession.sharedSecret
          );
          const redirectUrl = `${env.frontUrl}wallet-success?uuid=${userWallet.uniqueId}`;
          const dappPubKey = phantomSession.dappPublicKey || sessionStorage.getItem('dappPublicKey');
          const params = new URLSearchParams({
            dapp_encryption_public_key: dappPubKey,
            nonce: bs58.encode(nonce),
            redirect_link: redirectUrl,
            payload: bs58.encode(encrypted),
          });
          const url = `https://phantom.app/ul/v1/signTransaction?${params.toString()}`;
          setdepositLoader(false);
          if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.openLink(url, { try_instant_view: false });
          } else {
            window.location.href = url;
          }
          return;
          setdepositAmount(0);
          setSelectedCurrency("");
          setSelectedCurrencyLabel("");
          console.error(err);
        } catch (err) {
          console.error(err);
          setdepositAmount(0);
          setSelectedCurrency("");
          setSelectedCurrencyLabel("");
          console.error(err);
          setdepositLoader(false);
          showErrorToast(err.message || "Transaction failed");
        }
      }
    } catch (error) {
      setdepositLoader(false);
      console.error(error);
      showErrorToast("Transaction failed, please try again");
    }
  };

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
  
      const connection = await getSolanaConnection("confirmed");
      const mintAddress = new PublicKey(env.usdt_mint_address);
      const senderPublicKey = provider.publicKey;
      const receiverPublicKey = new PublicKey(env.Admin_wallet);
  
      // ✅ Check SOL balance for fees
      const solBalance = await connection.getBalance(senderPublicKey);
      if (solBalance < 5000) { // ~0.000005 SOL for fees
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
  
      const amount = Math.round(Number(depositAmountref.current) * 10 ** decimals);
      if (amount <= 0) {
        showErrorToast("Invalid amount");
        setdepositLoader(false);
        return;
      }
  
      // -----------------------------
      // 2️⃣ Derive ATAs
      // -----------------------------
      const senderATA = await getAssociatedTokenAddress(mintAddress, senderPublicKey);
      const receiverATA = await getAssociatedTokenAddress(mintAddress, receiverPublicKey);
  
      // -----------------------------
      // 3️⃣ Check USDT balance
      // -----------------------------
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        senderPublicKey,
        { mint: mintAddress }
      );
  
      if (!tokenAccounts.value.length) {
        showErrorToast("USDT balance not found");
        setdepositLoader(false);
        return;
      }
  
      const balance = Number(tokenAccounts.value[0].account.data.parsed.info.tokenAmount.amount);
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
            mintAddress
          )
        );
  
        ataTx.feePayer = senderPublicKey;
        ataTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  
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
          decimals
        )
      );
  
      transferTx.feePayer = senderPublicKey;
      transferTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  
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
        telegramId: teleId || localStorage.getItem("telegramId") || window.Telegram?.WebApp?.initDataUnsafe?.user?.id ,
        walletAddress: senderPublicKey.toString(),
        walletName: "solflare",
        depositAmount: depositAmountref.current,
        currency: "USDT",
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


//   const deposit = async () => {
//     try {
//       if (!selectedCurrency) {
//         setvalidatedeposit(true);
//         setvalidationCurrencymsg("Choose currency");
//         return;
//       } else {
//         setvalidatedeposit(false);
//         setvalidationCurrencymsg("");
//       }

//       if (!depositAmountref.current) {
//         setvalidatedeposit(true);
//         setvalidationmsg("Enter Amount");
//         return;
//       } else {
//         setvalidatedeposit(false);
//         setvalidationmsg("");
//       }

//       let provider;

//       if (walletName === "solflare") provider = window.solflare;
//       if (walletName === "phantom") provider = window.solana;

//       if (!provider) {
//         showErrorToast("Wallet not found");
//         return;
//       }

//       if (provider.connect) await provider.connect();

//       const connection = new web3.Connection(env.wallet_endpoint);
//       const mintAddress = new PublicKey(env.usdt_mint_address);
//       const senderPublicKey = provider.publicKey;
//       const receiverPublicKey = new PublicKey(env.Admin_wallet);

//       // decimals
//       const mintInfo = await connection.getParsedAccountInfo(mintAddress);
//       // const decimals = mintInfo.value.data.parsed.info.decimals;
//       // const amount = depositAmountref.current * Math.pow(10, decimals);
//    const decimals = mintInfo.value.data.parsed.info.decimals|| 6;
//       // const amount = depositAmountref.current * Math.pow(10, decimals);
//       const amount = BigInt(
//   Math.round(Number(depositAmountref.current) * 10 ** decimals)
// )
//       const senderATA = await getAssociatedTokenAddress(
//         mintAddress,
//         senderPublicKey
//       );

//       const receiverATA = await getAssociatedTokenAddress(
//         mintAddress,
//         receiverPublicKey
//       );

//       const transaction = new Transaction();

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

//       transaction.feePayer = senderPublicKey;
//       transaction.recentBlockhash = (
//         await connection.getLatestBlockhash()
//       ).blockhash;

//       // sign & send (Solflare / Phantom)
//       const tx = await provider.signAndSendTransaction(transaction);
//       await connection.confirmTransaction(tx.signature);
//       setwithdrawLoader(true);
//       const obj = {
//         telegramId: teleId || localStorage.getItem("telegramId"),
//         walletAddress: senderPublicKey.toString(),
//         WaletName: localStorage.getItem("walletName"),
//         depositAmount: depositAmountref.current,
//         currency: selectedCurrency,
//         txHash: tx.signature,
//       };
//       var data = {
//         apiUrl: apiService.transferToken,
//         payload: obj,
//       };
//       var resp = await postMethod(data);
//       setwithdrawLoader(false);
//       if (resp.success) {
//         showSuccessToast(resp.message);
//       } else {
//         showErrorToast("Transaction failed, please try again");
//       }
//       setdepositAmount(0);
//     } catch (err) {
//       console.log(err);
//       alert(err);
//       setdepositAmount(0);
//       setSelectedCurrency("");
//       setSelectedCurrencyLabel("");
//       setdepositLoader(false);
//       showErrorToast("Transaction failed, try again");
//     }
//   };

const WC_PROJECT_ID = env.metamakskProjectId;

// Arbitrum USDC
const USDC_ARB = env.USDC_ARB;

// Receiver wallet (admin)
const ADMIN_WALLET = env.Admin_wallet_ARB;

const ERC20_ABI = [
  "function decimals() view returns (uint8)",
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)"
];

  let wcProvider;
  let ethersProvider;
  let signer;

  const connectWalletMetamask = async () => {
    if (!wcProvider) {
      wcProvider = await EthereumProvider.init({
        projectId: WC_PROJECT_ID,
        chains: [42161], // Arbitrum
        optionalChains: [1], // allow ETH → ARB
        showQrModal: true,
      });
    }

    // 🔑 Connect wallet (Telegram required)
    const accounts = await wcProvider.enable();
    if (!accounts || !accounts.length) {
      alert("Wallet not connected");
      throw new Error("No accounts");
    }

    const provider = new ethers.BrowserProvider(wcProvider);

    // 🔁 SWITCH NETWORK FIRST
    const net = await provider.getNetwork();
    if (net.chainId !== 42161n) {
      try {
        await provider.send("wallet_switchEthereumChain", [
          { chainId: "0xa4b1" }, // 42161
        ]);
      } catch (err) {
        alert("Please switch to Arbitrum network");
        throw err;
      }
    }

    // ✅ NOW create signer
    const signer = await provider.getSigner(accounts[0]);
    const address = await signer.getAddress();
     setAddress(address);
     localStorage.setItem("walletAddress",address);
     localStorage.setItem("walletName", "metamask");
    return signer;
  };

  
    const [userWallet, setUserWallet] = useState({
    isConnected: false,
    walletAddress: "",
    walletName: "",
    uniqueId: "",
  });

  
   useEffect(() => {
    if (!telegramUser?.telegramId) return;
  
    getUserDetails();
    const intervalId = setInterval(() => {
      getUserDetails();
    }, 5000);
  
    return () => clearInterval(intervalId);
  // }, []);
  }, [telegramUser?.telegramId]);
  
   const [phantomSession,setPhantomSession]=useState();
   console.log(phantomSession,"phantomSession")
    const getUserDetails = async () => {
    try {
      if (!telegramUser?.telegramId) return;
      const resp = await postMethod({
        apiUrl: apiService.getUserDetails,
        payload: { telegramId: telegramUser?.telegramId},
      }); 
      console.log(resp,"===resp")
  
      if (resp.success && resp.data) {
        setUserWallet({
          isConnected: resp.data.wallet?.isConnected || false,
          walletAddress: resp.data.wallet?.walletAddress || "",
          walletName: resp.data.wallet?.walletName || "",
          uniqueId: resp.data.uniqueId || "",
        });
        // if(resp.data.wallet?.isConnected &&resp.data.wallet?.walletName=="Phantom"){
        // }
        // else{
        // localStorage.setItem("walletName","metamask")
        // }
        if(resp.data.wallet?.isConnected  ==true ){
        localStorage.setItem("walletAddress",resp.data.wallet?.walletAddress)
        localStorage.setItem("walletName","phantom")

        setAddress(resp.data.wallet?.walletAddress)
        }
        try {
          const parsed = JSON.parse(resp?.data?.jsonData);
          if (parsed && parsed.sharedSecret && parsed.nonce) {
            setPhantomSession({
              ...parsed,
              sharedSecret: bs58.decode(parsed.sharedSecret),
              nonce: bs58.decode(parsed.nonce)
            });
          }
        } catch (e) {
          console.log("No phantom session data:", e);
        }
      } else {
        console.error(resp.message || "Failed to fetch user details");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

// Solana Pay deposit via Phantom browse universal link.
// Telegram.WebApp.openLink only accepts https://, so we always use the
// https://phantom.app/ul/browse/ URL from this side.
// The /pay-redirect page (loaded inside Phantom's browser or a regular browser)
// handles the final routing to solana: or phantom:// as appropriate.
const depositViaSolanaPay = async () => {
  const label = selectedCurrencyLabel?.toUpperCase();
  const amount = depositAmountref.current;

  if (!amount || Number(amount) <= 0) {
    showErrorToast("Enter a valid deposit amount");
    return;
  }
  if (label !== "SOL" && label !== "USDC") {
    showErrorToast("TOKEN deposit coming soon");
    return;
  }

  // Unique reference key — lets us detect the tx on-chain without a redirect callback
  const refKeypair = web3.Keypair.generate();
  const refPubkey = refKeypair.publicKey.toBase58();

  const solanPayUrl =
    label === "USDC"
      ? `solana:${env.Admin_wallet}?amount=${amount}&spl-token=${env.usdt_mint_address}&label=Arken+Deposit&reference=${refPubkey}&message=Deposit+USDC+to+Arken`
      : `solana:${env.Admin_wallet}?amount=${amount}&label=Arken+SOL+Deposit&reference=${refPubkey}&message=Deposit+SOL+to+Arken`;

  const baseUrl = (env.frontUrl || (window.location.origin + "/")).replace(/\/?$/, "/");
  const connectedWallet = (walletName || localStorage.getItem("walletName") || "phantom").toLowerCase();
  // Pass enough context so PayRedirect can record the deposit without relying on mini-app polling
  const redirectPageUrl =
    `${baseUrl}pay-redirect` +
    `?url=${encodeURIComponent(solanPayUrl)}` +
    `&wallet=${encodeURIComponent(connectedWallet)}` +
    `&tid=${encodeURIComponent(telegramUserID || "")}` +
    `&amount=${encodeURIComponent(amount)}` +
    `&currency=${encodeURIComponent(label)}`;

  // Open the pay-redirect page directly in the user's browser.
  // Telegram.WebApp.openLink always opens in an external browser (Chrome/Safari),
  // so the pay-redirect page knows it's in a real browser and can safely use
  // phantom:// custom scheme to open Phantom specifically.
  setdepositLoader(true);

  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.openLink(redirectPageUrl, { try_instant_view: false });
  } else {
    window.open(redirectPageUrl, "_blank");
  }

  // Poll blockchain for the tx that contains our reference key.
  // No heavy RPC calls — just getSignaturesForAddress (lightweight).
  try {
    const connection = new Connection(SOLANA_RPC);
    const refPk = new web3.PublicKey(refPubkey);

    const txSignature = await new Promise((resolve, reject) => {
      let count = 0;
      const MAX_POLLS = 80; // ~4 min at 3s intervals
      let timer = null;
      let done = false;

      const cleanup = () => {
        done = true;
        clearTimeout(timer);
        document.removeEventListener("visibilitychange", onVisible);
      };

      const check = async () => {
        if (done) return;
        if (count >= MAX_POLLS) { cleanup(); reject(new Error("timeout")); return; }
        count++;
        try {
          const sigs = await connection.getSignaturesForAddress(refPk, { limit: 5 });
          if (sigs.length > 0 && !sigs[0].err) { cleanup(); resolve(sigs[0].signature); return; }
        } catch (_) { /* ignore transient RPC errors */ }
        timer = setTimeout(check, 3000);
      };

      // Poll immediately when user returns from the wallet app
      const onVisible = () => {
        if (!done && document.visibilityState === "visible") {
          clearTimeout(timer);
          // Reset loader as soon as user returns — cron will credit balance if tx went through
          setdepositLoader(false);
          check();
        }
      };
      document.addEventListener("visibilitychange", onVisible);
      timer = setTimeout(check, 5000);
    });

    const obj = {
      telegramId: teleId || localStorage.getItem("telegramId"),
      walletAddress: Address || userWallet?.walletAddress || localStorage.getItem("walletAddress"),
      depositAddress: env.Admin_wallet,
      WaletName: connectedWallet,
      depositAmount: amount,
      currencySymbol: label,
      txHash: txSignature,
    };
    const resp = await postMethod({ apiUrl: apiService.transferToken, payload: obj });
    setdepositLoader(false);

    if (resp.success) {
      showSuccessToast(resp.message || "Deposit successful!");
      setdepositAmount(0);
      setSelectedCurrency("");
      setSelectedCurrencyLabel("");
      navigate("/markets");
    } else {
      showErrorToast(resp.message || "Failed to record deposit");
    }
  } catch (err) {
    setdepositLoader(false);
    if (err.message === "timeout") {
      showErrorToast("Transaction not detected yet. If you approved, your balance will update shortly.");
    } else {
      showErrorToast("Error detecting transaction. Please try again.");
    }
  }
};

const handleSolanaDeposit = async () => {
  const label = selectedCurrencyLabel?.toUpperCase();
  if (!label) {
    showErrorToast("Please select a currency");
    return;
  }

  if (walletName === "solflare") {
    if (label === "SOL") await depositCurrency();
    else if (label === "USDC") await deposit();
    else showErrorToast("TOKEN deposit coming soon");
  } else if (walletName === "phantom" && phantomSession?.session && phantomSession?.sharedSecret) {
    // Phantom connected wallet with valid session — use signTransaction deep link.
    // This opens Phantom's native signing UI (NOT a WebView), which avoids the blank screen
    // issue that occurs when Phantom's in-app browser loads the pay-redirect page.
    await depositCurrency();
  } else {
    // Phantom without a session, or other wallets — use Solana Pay flow
    await depositViaSolanaPay();
  }
};

const sendusdcfn = async () => {
  if (!phantomSession || !phantomSession.session || !phantomSession.sharedSecret) {
    showErrorToast("Phantom session not found. Please reconnect your wallet.");
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
      // dappKeyPair
        d_key_secret:sessionStorage.getItem('dappSecretKey'),
      d_key_public:sessionStorage.getItem('dappPublicKey')
    });
  } catch (error) {
    console.log(error);
    alert(error);
  }
};

async function sendUSDC({ fromPublicKey, toAddress, amount, phantomSession, d_key_secret,d_key_public }) {
  try {
    const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
    const connection = new Connection(SOLANA_RPC);

    const from = new PublicKey(fromPublicKey);
    const to = new PublicKey(toAddress);

    // Get ATAs
    const fromATA = await getAssociatedTokenAddress(USDC_MINT, from);
    const toTokenAccount = await getAssociatedTokenAddress(USDC_MINT, to, true);
    const fromATAInfo = await connection.getAccountInfo(fromATA);
    if (!fromATAInfo) {
      showErrorToast("No USDC found in your wallet. Add USDC first.");
      setdepositLoader(false);
      return;
    }
 const balanceInfo = await connection.getTokenAccountBalance(fromATA);

const usdcBalance = balanceInfo.value.uiAmount; // already divided by 1e6

console.log("USDC Balance:", usdcBalance);
     if(usdcBalance<env.MINIMUM_MAITANNACE_SOL){
        showErrorToast(`Need to maintain your balance for ${env.MINIMUM_MAITANNACE_SOL} Sol`)
        setdepositLoader(false);
        return
      }
    const ix = [];
    // Check if receiver's ATA exists
    const info = await connection.getAccountInfo(toTokenAccount);
    if (!info) {
      ix.push(
        createAssociatedTokenAccountInstruction(
          from,
          toTokenAccount,
          to,
          USDC_MINT
        )
      );
    }

    // Add transfer instruction
    ix.push(
      createTransferInstruction(
        fromATA,
        toTokenAccount,
        from,
        Number(amount) * 1_000_000
      )
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
      verifySignatures: false
    });

    // Create a NEW nonce for this request
    const nonce = nacl.randomBytes(24);

    // Prepare the payload (must include session token)
    const payload = {
      transaction: bs58.encode(serializedTx),
      session: phantomSession.session  // ✅ Critical: include session from connect
    };

    // Encrypt the payload
    const encrypted = nacl.box.after(
      new TextEncoder().encode(JSON.stringify(payload)),
      nonce,
      phantomSession.sharedSecret
    );

    // Redirect URL
    const redirectUrl = `${env.frontUrl}wallet-success?uuid=${userWallet.uniqueId}`;

    // Build Phantom signTransaction deep link
    // Use dappPublicKey from the persisted session (survives mini-app restarts)
    const dappPubKey = phantomSession.dappPublicKey || d_key_public || sessionStorage.getItem('dappPublicKey');
    const params = new URLSearchParams({
      dapp_encryption_public_key: dappPubKey,
      nonce: bs58.encode(nonce),
      redirect_link: redirectUrl,
      payload: bs58.encode(encrypted)
    });

    // ✅ Use signTransaction endpoint (not signAndSendTransaction)
    const url = `https://phantom.app/ul/v1/signTransaction?${params.toString()}`;

    console.log("🔗 Opening Phantom URL");

    // Open in Telegram or browser
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.openLink(url, {
        try_instant_view: false
      });
    } else {
      window.location.href = url;
    }

  } catch (error) {
    console.error("❌ Error sending USDC:", error);
    alert(`Error: ${error.message}`);
    throw error;
  }
}
useEffect(() => {
  if (telegramUserID) getTransaction();
}, [telegramUserID]);
const getTransaction = async () => {
  try {
    const resp = await postMethod({
      apiUrl: apiService.get_deposit_list,
      payload: { telegramId: telegramUserID },
    });
    if (resp?.success && Array.isArray(resp.data)) {
      setDepositHistory(resp.data);
    }
  } catch (error) {
    console.error("getTransaction error:", error);
  }
}
 const handleEvmTransfer = async () => {
    try {
      if (!depositAmountref.current) {
        alert("Enter amount");
        return;
      }
      setdepositLoader(true);
      const signer = await connectWalletMetamask();
      const network = await signer.provider.getNetwork();
      alert(network.chainId);
      if (network.chainId !== 42161n) {
        alert("Please switch to Arbitrum network");
        setLoading(false);
        return;
      }
      // alert(localStorage.getItem("walletAddress",)||Address)
      const usdc = new Contract(USDC_ARB, ERC20_ABI, signer);
       const balance = await usdc.balanceOf(Addressref.current);
            if(balance<env.MINIMUM_MAITANNACE_ARB){
              showErrorToast(`Need to maintain your balance for ${env.MINIMUM_MAITANNACE_ARB} ARB`)
              setdepositLoader(false);
              return
            }
      const value = parseUnits(depositAmountref.current.toString(), 6);
      const tx = await usdc.transfer(ADMIN_WALLET, value);
      await tx.wait();
      if (tx) {
        const obj = {
          telegramId:teleId ||localStorage.getItem("telegramId") ||window.Telegram?.WebApp?.initData,
          walletAddress: localStorage.getItem("walletAddress")||Address,
          WaletName: "metamask",
          depositAmount: depositAmountref.current,
          currency: selectedCurrency,
          currencySymbol: "USDC",
          txHash: tx,
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
        } else {
          showErrorToast("Transaction failed, please try again");
        }
        setdepositLoader(false);
      } else {
        showErrorToast("Transaction failed, please try again");
      }
    } catch (err) {
      console.error(err);
      alert(err?.shortMessage || err.message);
      setdepositLoader(false);
    }
  };

  // const handleEvmTransfer = async () => {
  //   try {
  //     if (!selectedCurrency) {
  //       setvalidatedeposit(true);
  //       setvalidationCurrencymsg("Choose currency");
  //       return;
  //     } else {
  //       setvalidatedeposit(false);
  //       setvalidationCurrencymsg("");
  //     }

  //     if (!depositAmountref.current) {
  //       setvalidatedeposit(true);
  //       setvalidationmsg("Enter Amount");
  //       return;
  //     } else {
  //       setvalidatedeposit(false);
  //       setvalidationmsg("");
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
  //       walletAddress: localStorage.getItem("walletAddress"),
  //       WaletName: walletName,
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
  //       showErrorToast("Transaction failed, please try again");
  //     setdepositLoader(false);
  //     // alert("Check if wallet is on Arbitrum"); 
  //     }
  // }; ARB TRANSFER
  return (
    <>
      <div
        className="main_marketdetailsdiv"
        style={pageStyle.main_marketdetailsdiv}
      >
        <div
          className="cmmn_bdy_mainwrp mrkt_dtl_wrp"
          style={pageStyle.mrkt_dtl_wrp}
        >
          <div className="">

             <div className="wllt_top_cntWrp" style={pageStyle.wllt_top_cntWrp}>
          <div className="wllt_top_cnt" style={pageStyle.wllt_top_cnt}>
             <h5 style={pageStyle.wllt_top_cntHead}>
      {activeTab === "deposit" ? "Deposit" : "Withdraw"}
    </h5>

    <p style={pageStyle.wllt_top_cntPara}>
      {activeTab === "deposit"
        ? "Add funds to your wallet securely"
        : "Withdraw your funds safely to your external wallet"}
    </p>
  </div>
          <ImageComponent
            styles={pageStyle.wllt_top_img}
            imgPic={activeTab === "deposit" ? Deposit_img : Withdraw_img}
    alt={activeTab === "deposit" ? "deposit_img" : "withdraw_img"}
          />
        </div>
            {/* <div className="obrd_back_wrp " style={pageStyle.obrd_back_wrp}>
              <span
                style={pageStyle.obrd_back_txt}
                onClick={() => {
                  handleStepReduce();
                }}
              >
                <MdOutlineArrowBackIosNew style={pageStyle.obrd_back_txt2} />{" "}
                Back
              </span>
            </div> */}
            <div
              className="depositand_withdrawpagemain"
              style={pageStyle.depositand_withdrawpagemain}
            >
              <div className="tabs-container" style={pageStyle.tabscontainer}>
                <div className="tabs-wrapper" style={pageStyle.tabswrapper}>
                  <button
                    onClick={() => setActiveTab("deposit")}
                    style={pageStyle.tabbutton}
                    className={`tab-button ${
                      activeTab === "deposit" ? "active" : ""
                    }`}
                  >
                    Deposit
                  </button>

                  <button
                    style={pageStyle.tabbutton}
                    onClick={() => setActiveTab("withdraw")}
                    className={`tab-button ${
                      activeTab === "withdraw" ? "active" : ""
                    }`}
                  >
                    Withdraw
                  </button>
                </div>

                <div className="tab-content" style={pageStyle.tabcontent}>
                  {activeTab === "deposit" ? (
                    <div>
                      <div className="deposit-form-container">

                        {localStorage.getItem('walletName')== 'newwallet'?
                        <ImageComponent
                      styles={pageStyle.obrd_middl_tpImg}
                      // imgPic={`https://quickchart.io/chart?chs=168x168&chld=M|0&cht=qr&chl=${Addressref.current}`}
                        imgPic={`https://quickchart.io/chart?chs=168x168&chld=M|0&cht=qr&chl=${encodeURIComponent(Addressref.current)}`}

                      alt="obrd_middl_tpImg"
                      className="qrcodeBox m-5"
                    />
                        :  <><div className="form-field" style={pageStyle.formfield}>
                          <label
                            className="field-label"
                            style={pageStyle.fieldlabel}
                          >
                            Currency
                          </label>
                          <div
                            className="currency-select"
                            style={pageStyle.currencyselect}
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          >
                            <div
                              className="currency-content"
                              style={pageStyle.currencycontent}
                            >
                              {selectedCurrencyLabel ? (
                                <div
                                  className="currency-icon"
                                  style={pageStyle.currencyicon}
                                >
                                  {/* <img
                                    style={pageStyle.currencyicon}
                                    src={SelectedCurrencyImage}
                                  ></img> */}
                                  <div
                                    className="sol-icon"
                                    style={pageStyle.solicon}
                                  ></div>
                                </div>
                              ) : (
                                ""
                              )}
                              <span
                                className="currency-text"
                                style={pageStyle.currencytext}
                              >
                                {selectedCurrencyLabel
                                  ? selectedCurrencyLabel
                                  : "Select Currency"}
                              </span>
                            </div>
                            <span
                              className={`dropdown-arrow ${
                                isDropdownOpen ? "open" : ""
                              }`}
                              style={pageStyle.dropdownarrow}
                            >
                              ›
                            </span>
                          </div>

                          <div
                            className={`dropdown-menu ${
                              isDropdownOpen ? "show" : ""
                            }`}
                            style={pageStyle.dropdownmenu}
                          >
                            {currencyList.map((currency, index) => (
                              <div
                                key={index}
                                className="dropdown-item"
                                style={pageStyle.dropdownitem}
                                onClick={() => handleCurrencySelect(currency)}
                              >
                                {currency.label}
                              </div>
                            ))}
                          </div>
                        </div>
                        {validatedeposit ? (
                          <p className="validate" translate="yes">
                            {validationCurrencymsg}
                          </p>
                        ) : (
                          ""
                        )}

                        <div className="form-field" style={pageStyle.formfield}>
                          <label
                            className="field-label"
                            style={pageStyle.fieldlabel}
                          >
                            Amount
                          </label>
                          <div
                            className="amount-container"
                            style={pageStyle.amountcontainer}
                          >
                            <button
                              className="amount-btn"
                              style={pageStyle.amountbtn}
                              onClick={handleDecrement}
                            >
                              -
                            </button>
                            <div className="amount-display">
                              <input
                                type="number"
                                name="depositAmount"
                                value={depositAmountref.current}
                                onChange={handleChange}
                                placeholder="0"
                                onKeyDown={(e) => {
                                  if (
                                    e.key === "ArrowUp" ||
                                    e.key === "ArrowDown"
                                  ) {
                                    e.preventDefault();
                                  }
                                }}
                                className="amount-input"
                                style={pageStyle.amountinput}
                              />
                              <div
                                className="amount-placeholder"
                                style={pageStyle.amountplaceholder}
                              >
                                Enter the amount
                              </div>
                            </div>
                            <button
                              className="amount-btn"
                              onClick={handleIncrement}
                            >
                              +
                            </button>
                          </div>
                          {validatedeposit ? (
                            <p className="validate" translate="yes">
                              {validationmsg}
                            </p>
                          ) : (
                            ""
                          )}
                          {amountUsd !== null && (
                            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginTop: '4px', marginBottom: 0 }}>
                              ≈ ${amountUsd} USD
                            </p>
                          )}
                        </div>
</>
                        }
                      
                        {/* <div className="form-field" style={pageStyle.formfield}>
                          <label
                            className="field-label"
                            style={pageStyle.fieldlabel}
                          >
                            Wallet Address
                          </label>
                          <div
                            className="wallet-address"
                            style={pageStyle.walletaddress}
                          >
                            <span
                              className="wallet-text"
                              style={pageStyle.wallettext}
                            >
                              {Addressref.current}{" "}
                            </span>
                          </div>
                        </div> */}

                      <div className="form-field" style={pageStyle.formfield}>
  <label className="field-label" style={pageStyle.fieldlabel}>
    Wallet Address
  </label>
  <div className="wallet-address" style={pageStyle.walletaddress}>
    <span className="wallet-text" style={pageStyle.wallettext}>
      {Addressref.current}
    </span>
    <button
      className="copy-icon-btn"
      onClick={() => copyAddress(Addressref.current)}
      style={pageStyle.copyiconbtn}
      title="Copy wallet address"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
    </button>
  </div>
</div>
                      </div>

                      <div
                        className="info-alert-wrapper"
                        style={pageStyle.infoalertwrapper}
                      >
                        <div className="info-alert" style={pageStyle.infoalert}>
                          <div className="info-icon" style={pageStyle.infoicon}>
                            <span
                              className="icon-text"
                              style={pageStyle.icontext}
                            >
                              i
                            </span>
                          </div>
                          <div className="info-content">
                            <p className="info-text" style={pageStyle.infotext}>
                              Ensure you send the correct cryptocurrency to this
                              wallet address. Sending any other token may result
                              in permanent loss of funds
                            </p>
                          </div>
                        </div>
                      </div>
  {localStorage.getItem('walletName')== 'newwallet'?""
  :
                      depositLoader == true ? (
                        <button
                          className="deponbord_subtbtn"
                          style={pageStyle.deponbord_subtbtn}
                        >
                          Loading...
                        </button>
                      ) : walletName == "metamask" ? (
                        <button
                          className="deponbord_subtbtn"
                        onClick={() => handleEvmTransfer()}
                          style={pageStyle.deponbord_subtbtn}
                        >
                          Deposit
                        </button>
                      ) :(
                        <button
                          className="deponbord_subtbtn"
                          // onClick={() => deposit()}
                           onClick={handleSolanaDeposit}
                          style={pageStyle.deponbord_subtbtn}
                        >
                          Deposit
                        </button>
                      )}

                      {/* Deposit History */}
                      {depositHistory.length > 0 && (
                        <div style={{ marginTop: "24px" }}>
                          <p style={{ color: "#fff", fontWeight: 700, fontSize: "15px", marginBottom: "12px" }}>
                            Deposit History
                          </p>
                          {depositHistory.map((item, idx) => (
                            <div key={idx} style={{
                              background: "rgba(255,255,255,0.06)",
                              borderRadius: "10px",
                              padding: "12px 16px",
                              marginBottom: "10px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}>
                              <div>
                                <p style={{ color: "#fff", fontSize: "14px", margin: 0, fontWeight: 600 }}>
                                  {item.Amount} {item.currencySymbol}
                                </p>
                                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", margin: "4px 0 0" }}>
                                  {new Date(item.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <span style={{
                                fontSize: "12px",
                                fontWeight: 700,
                                color: item.status === "COMPLETE" ? "#4ade80" : item.status === "CANCEL" ? "#f87171" : "#fbbf24",
                              }}>
                                {item.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="deposit-form-container">
                        {withdrawBalance !== null && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '10px 14px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px' }}>
                            <span style={{ fontSize: `${moderateScale(12)}px`, color: 'rgba(255,255,255,0.5)' }}>Available balance</span>
                            <span style={{ fontSize: `${moderateScale(14)}px`, fontWeight: 700, color: '#fff' }}>${withdrawBalance.toFixed(2)} USDC</span>
                          </div>
                        )}
                        <div className="form-field" style={pageStyle.formfield}>
                          <label
                            className="field-label"
                            style={pageStyle.fieldlabel}
                          >
                            Currency
                          </label>
                          <div
                            className="currency-select"
                            style={pageStyle.currencyselect}
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          >
                            <div
                              className="currency-content"
                              style={pageStyle.currencycontent}
                            >
                              {selectedCurrencyLabel ? (
                                <div
                                  className="currency-icon"
                                  style={pageStyle.currencyicon}
                                >
                                  {/* <img
                                    style={pageStyle.currencyicon}
                                    src={SelectedCurrencyImage}
                                  ></img> */}
                                  <div
                                    className="sol-icon"
                                    style={pageStyle.solicon}
                                  ></div>
                                </div>
                              ) : (
                                ""
                              )}
                              <span
                                className="currency-text"
                                style={pageStyle.currencytext}
                              >
                                {selectedCurrencyLabel
                                  ? selectedCurrencyLabel
                                  : "Select Currency"}
                              </span>
                            </div>
                            <span
                              className={`dropdown-arrow ${
                                isDropdownOpen ? "open" : ""
                              }`}
                              style={pageStyle.dropdownarrow}
                            >
                              ›
                            </span>
                          </div>

                          <div
                            className={`dropdown-menu ${
                              isDropdownOpen ? "show" : ""
                            }`}
                            style={pageStyle.dropdownmenu}
                          >
                            {currencyList.length > 0 ? (
                              currencyList.map((currency, index) => (
                                <div
                                  key={index}
                                  className="dropdown-item"
                                  style={pageStyle.dropdownitem}
                                  onClick={() => handleCurrencySelect(currency)}
                                >
                                  {currency.label}
                                </div>
                              ))
                            ) : (
                              <div
                                className="dropdown-item"
                                style={pageStyle.dropdownitem}
                              >
                                Select Currency
                              </div>
                            )}
                          </div>
                        </div>
                        {touched.currency && errors.currency && (
                          <p className="error-text">{errors.currency}</p>
                        )}
                        <div className="form-field" style={pageStyle.formfield}>
                          <label
                            className="field-label"
                            style={pageStyle.fieldlabel}
                          >
                            Amount (USD $)
                          </label>
                          <div
                            className="amount-container"
                            style={pageStyle.amountcontainer}
                          >
                            <button
                              className="amount-btn"
                              style={pageStyle.amountbtn}
                              onClick={handleDecrement}
                            >
                              -
                            </button>
                            <div className="amount-display">
                              <input
                                type="text"
                                value={amount}
                                onChange={handleAmountChange}
                                placeholder="0"
                                className="amount-input"
                                style={pageStyle.amountinput}
                              />
                              <div
                                className="amount-placeholder"
                                style={pageStyle.amountplaceholder}
                              >
                                Enter USD amount
                              </div>
                            </div>
                            <button
                              className="amount-btn"
                              onClick={handleIncrement}
                            >
                              +
                            </button>
                          </div>
                          {withdrawCryptoEquiv && (
                            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginTop: '4px', marginBottom: 0 }}>
                              ≈ {withdrawCryptoEquiv.amount} {withdrawCryptoEquiv.symbol} you will receive
                            </p>
                          )}
                        </div>
                        {touched.amount && errors.amount && (
                          <p className="error-text">{errors.amount}</p>
                        )}
                        <div className="form-field" style={pageStyle.formfield}>
                          <label
                            className="field-label"
                            style={pageStyle.fieldlabel}
                          >
                            Wallet Address
                          </label>
                          {/* <div
                            className="wallet-address"
                            style={pageStyle.walletaddress}
                          >
                            <span
                              className="wallet-text"
                              style={pageStyle.wallettext}
                            >
                              {Address}{" "}
                            </span>
                            <span
                              className="wallet-arrow"
                              style={pageStyle.walletarrow}
                            >
                              ›
                            </span>
                          </div> */}

                           <div className="amount-display">
                             {/* <div
                            className="amount-container"
                            style={pageStyle.amountcontainer}
                          > */}
                            <input
  type="text"
  value={withdrawAddress}
  onChange={handleWithdrawAddress}
  // placeholder="Enter withdraw address"
  className="wallet-address wallet-text"
  style={pageStyle.addesssInput}
/>
{/* </div>   */}
                              <div
                                className="error-text"
                                style={pageStyle.amountplaceholder}
                              >
                           {addressError}
                              </div>
                            </div>

                        </div>
                      </div>

                      <div
                        className="info-alert-wrapper"
                        style={pageStyle.infoalertwrapper}
                      >
                        <div className="info-alert" style={pageStyle.infoalert}>
                          <div className="info-icon" style={pageStyle.infoicon}>
                            <span
                              className="icon-text"
                              style={pageStyle.icontext}
                            >
                              i
                            </span>
                          </div>
                          <div className="info-content">
                            <p className="info-text" style={pageStyle.infotext}>
                              Make sure you withdraw the correct cryptocurrency
                              to your wallet. Sending any other token may result
                              in permanent loss of funds
                            </p>
                          </div>
                        </div>
                      </div>
                         {/* {teleId?teleId:telegramUser?.telegramId} */}
                      {withdrawLoader == true ? (
                        <button
                          className="deponbord_subtbtn"
                          style={pageStyle.deponbord_subtbtn}
                        >
                          Loading...
                        </button>
                      ) : (
                        <button
                          className="deponbord_subtbtn"
                          onClick={handleSubmit}
                          style={pageStyle.deponbord_subtbtn}
                        >
                          Withdraw
                        </button>
                      )}

                      {/* Withdraw History */}
                      {withdrawHistory.length > 0 && (
                        <div style={{ marginTop: "24px" }}>
                          <p style={{ color: "#fff", fontWeight: 700, fontSize: "15px", marginBottom: "12px" }}>
                            Withdraw History
                          </p>
                          {withdrawHistory.map((item, idx) => {
                            const statusMap = { 0: "Pending", 1: "Processing", 2: "Completed", 3: "Cancelled", 4: "Rejected" };
                            const colorMap = { 0: "#fbbf24", 1: "#60a5fa", 2: "#4ade80", 3: "#f87171", 4: "#f87171" };
                            return (
                              <div key={idx} style={{
                                background: "rgba(255,255,255,0.06)",
                                borderRadius: "10px",
                                padding: "12px 16px",
                                marginBottom: "10px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}>
                                <div>
                                  <p style={{ color: "#fff", fontSize: "14px", margin: 0, fontWeight: 600 }}>
                                    {item.amount} {item.currency_symbol}
                                  </p>
                                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", margin: "4px 0 0" }}>
                                    {new Date(item.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                                <span style={{
                                  fontSize: "12px",
                                  fontWeight: 700,
                                  color: colorMap[item.status] || "#fbbf24",
                                }}>
                                  {statusMap[item.status] || "Pending"}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

         <BottomTab tabAct={2} />
      </div>
    </>
  );
};

const pageStyle = {
  depositand_withdrawpagemain: {
    paddingTop: `${moderateScale(24)}px`,
  },
  tabswrapper: {
    marginBottom: `${moderateScale(32)}px`,
  },
  tabbutton: {
    padding: `${moderateScale(12)}px`,
    fontSize: `${moderateScale(14)}px`,
  },
  icontext: {
    fontSize: `${moderateScale(16)}px`,
  },
  copyiconbtn: {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
  color:'#fff',
  marginLeft: `${moderateScale(8)}px`
},
  tabcontent: {
    marginTop: `${moderateScale(32)}px`,
  },
  infoalert: {
    padding: `${moderateScale(16)}px`,
    gap: `${moderateScale(16)}px`,
  },
  formfield: {
    marginBottom: `${moderateScale(24)}px`,
  },
  infotext: {
    fontSize: `${moderateScale(12)}px`,
  },
  infoicon: {
    width: `${moderateScale(21)}px`,
    height: `${moderateScale(21)}px`,
  },
  dropdownitem: {
    padding: `${moderateScale(16)}px ${moderateScale(20)}px`,
    fontSize: `${moderateScale(16)}px`,
  },
  fieldlabel: {
    fontSize: `${moderateScale(14)}px`,
    marginBottom: `${moderateScale(12)}px`,
  },
  wallettext: {
    fontSize: `${moderateScale(14)}px`,
  },
  walletarrow: {
    fontSize: `${moderateScale(24)}px`,
  },
  deponbord_subtbtn: {
    fontSize: `${moderateScale(14)}px`,
    gap: `${moderateScale(10)}px`,
    padding: `${moderateScale(15)}px ${moderateScale(10)}px`,
  },
  infoalertwrapper: {
    marginBottom: `${moderateScale(64)}px`,
  },
  walletaddress: {
    padding: `${moderateScale(5)}px ${moderateScale(12)}px`,
  },
  amountplaceholder: {
    fontSize: `${moderateScale(13)}px`,
  },
  amountcontainer: {
    padding: `${moderateScale(14)}px ${moderateScale(24)}px`,
    gap: `${moderateScale(16)}px`,
  },
  amountinput: {
    fontSize: `${moderateScale(32)}px`,
    marginBottom: `${moderateScale(4)}px`,
  },
  addesssInput:{
      fontSize: `${moderateScale(13)}px`,
    marginBottom: `${moderateScale(4)}px`,
  },
  currencytext: {
    fontSize: `${moderateScale(16)}px`,
  },
  amountbtn: {
    fontSize: `${moderateScale(32)}px`,
    // width: `${moderateScale(40)}px`,
    height: `${moderateScale(40)}px`,
    padding: `${moderateScale(0)}px`,
  },
  dropdownmenu: {
    marginTop: `${moderateScale(8)}px`,
  },
  dropdownarrow: {
    fontSize: `${moderateScale(24)}px`,
  },
  currencycontent: {
    gap: `${moderateScale(12)}px`,
  },
  currencyicon: {
    width: `${moderateScale(24)}px`,
    height: `${moderateScale(24)}px`,
  },
  solicon: {
    width: `${moderateScale(20)}px`,
    height: `${moderateScale(20)}px`,
  },
  currencyselect: {
    padding: `${moderateScale(3.5)}px ${moderateScale(18)}px ${moderateScale(
      6.8
    )}px ${moderateScale(12)}px`,
  },
   wllt_top_cntWrp: {
    padding: `${moderateScale(16)}px ${moderateScale(16)}px`,
  },
  wllt_top_img: {
    width: `${moderateScale(41)}px`,
    height: `${moderateScale(41)}px`,
  },
  wllt_top_cnt: {
    gap: `${moderateScale(4)}px`,
  },
  wllt_top_cntHead: {
    fontSize: `${moderateScale(18)}px`,
  },
   wllt_top_cntPara: {
    fontSize: `${moderateScale(12)}px`,
  },
   tabscontainer: {
    paddingBottom: `${moderateScale(90)}px`,
  },
};


export default Deposit;
