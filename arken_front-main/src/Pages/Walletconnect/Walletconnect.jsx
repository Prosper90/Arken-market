// import React, { useEffect, useRef, useState } from 'react'
// import './walletConnect.css'
// import { moderateScale } from '../../utils/Scale'
// import toast from "react-hot-toast";
// import { useNavigate } from 'react-router-dom'
// import apiService from "../../core/sevice/detail";
// import { postMethod,getMethod } from "../../core/sevice/common.api";
// import { verify } from 'tweetnacl';
// import { env } from '../../core/sevice/envconfig';
// import { useSearchParams } from "react-router-dom";

// import nacl from "tweetnacl";
// import bs58 from "bs58";


// const WalletConnect = () => {
//   const[url,setUrl]= useState("")
//   const[Address,setAddress]= useState("")
// const hasRun = useRef(false); 
  

  
// //  useEffect( ()=>{
// //     const  getUrl = window.location.pathname.split("/wallet-details/")[1];
// //     console.log(window.location.pathname.split("/wallet-details/"),"getUrl")
// //       verifyId(getUrl)
// // },[0])
//   const [toastId, setToastId] = useState(null);

// //  const showSuccessToast = (message) => {
// //     if (toastId) {
// //       toast.dismiss(toastId);
// //     }
// //     const newToastId = toast.success(message);
// //     setToastId(newToastId);
// //   };
// //   const showErrorToast = (message) => {
// //     if (toastId) {
// //       toast.dismiss(toastId);
// //     }
// //     const newToastId = toast.error(message);
// //     setToastId(newToastId);
// //   };
// // const verifyId =async (id)=>{
// //   try {
// //      var obj={
// //                 UniqueId:id,
// //                 connectedwalletName:"Phantam",
// // connectedwalletAddress:Address,
// // connectedwalletStatus:true
// //              }

// //           var data = {
// //                   apiUrl: apiService.verify_id,
// //                   payload: obj,
// //                 };
// //                 var resp = await postMethod(data);
// //                 if (resp.success) {
// //                   showSuccessToast(resp.message);
// //                 } else {
// //                   showErrorToast("Transaction failed, please try again");
// //                 }
// //   } catch (error) {
// //     console.log(error,"============================");
// //   }
// // }
// // useEffect(()=>{
// //   getPhantomPublicKey()
// // })
  
// // function getPhantomPublicKey() {
// //  try {
// //    const urlParams = new URLSearchParams(window.location.search);
// //   console.log(urlParams,"urlParams")
// //   const phantomPubKey = urlParams.get("phantom_encryption_public_key");
// //   // phantomPubKey?alert(phantomPubKey):""
// //   console.log(urlParams,"urlParams")
// //   const data = urlParams.get("data");
// //   const nonce = urlParams.get("nonce");
// //   //  alert(`phantomPubKey:${phantomPubKey}`)
// //   //  alert(`data:${data}`)
// //   //  alert(`nonce:${nonce}`)
// //   if (!phantomPubKey || !data || !nonce) return null;

// //   const sharedSecret = nacl.box.before(
// //     bs58.decode(phantomPubKey),
// //     dappKeyPair.secretKey
// //   );

// //   const decrypted = nacl.box.open.after(
// //     bs58.decode(data),
// //     bs58.decode(nonce),
// //     sharedSecret
// //   );

// //   const payload = JSON.parse(new TextDecoder().decode(decrypted));
// //   // alert(payload.public_key,"payload.public_key")
// //   setAddress(payload.public_key,)
// //   return payload.public_key; // ✅ WALLET ADDRESS
// //  } catch (error) {
// //   console.log(error,"==========");
// //  }
// // }


//  useEffect(() => {
//     if (hasRun.current) return;
//     hasRun.current = true;

//     const runVerification = async () => {
//       try {
//         const params = new URLSearchParams(window.location.search);

//         const uniqueId = params.get("uuid");
//         const nonce = params.get("nonce");
//         const encryptedData = params.get("data");
//         const walletEncryptionPubKey =
//           params.get("phantom_encryption_public_key"); 

//         if (!uniqueId || !nonce || !encryptedData || !walletEncryptionPubKey) {
//           throw new Error("Missing URL params");
//         }

//         const decrypted = nacl.box.open(
//           bs58.decode(encryptedData),
//           bs58.decode(nonce),
//           bs58.decode(walletEncryptionPubKey),
//           dappKeyPair.secretKey
//         );

//         if (!decrypted) {
//           throw new Error("Failed to decrypt wallet payload");
//         }

//         const payload = JSON.parse(
//           new TextDecoder().decode(decrypted)
//         );

//         const walletAddress = payload.public_key;

//         if (!walletAddress) {
//           throw new Error("Wallet address missing");
//         }

//         await verifyId({
//           uniqueId,
//           walletAddress,
//         });

//       } catch (err) {
//         console.error("Wallet verification failed:", err);
//       }
//     };

//     runVerification();
//   }, []);


// const verifyId = async ({ uniqueId, walletAddress }) => {
//   try {
//     if (!uniqueId || !walletAddress) {
//       throw new Error("Missing uniqueId or walletAddress");
//     }

//     const payload = {
//       uniqueId,
//       connectedwalletName: "Phantom",
//       connectedwalletAddress: walletAddress,
//       connectedwalletStatus: true,
//     };

//     const data = {
//       apiUrl: apiService.verify_id,
//       payload,
//     };

//     const resp = await postMethod(data);

//     if (resp.success) {
//       showSuccessToast(resp.message);
//     } else {
//       showErrorToast(resp.message || "Transaction failed");
//     }
//   } catch (error) {
//     console.error("verifyId error:", error);
//     showErrorToast("Wallet verification failed");
//   }
// };

//   return (

//      <div className='cmmn_bdy_mainwrp' style={pageStyle.cmmn_bdy_mainwrp}>
//       <div className='wallet_connected_wrp' style={pageStyle.wallet_connected_wrp}>
//         <div className='check_icon_wrp' style={pageStyle.check_icon_wrp}>
//           <svg 
//             style={pageStyle.check_icon}
//             viewBox="0 0 24 24" 
//             fill="none" 
//             stroke="white" 
//             strokeWidth="3"
//           >
//             <polyline points="20 6 9 17 4 12"></polyline>
//           </svg>
//         </div>

//         <h2 style={pageStyle.connected_title}>Successfully Connected</h2>
//         <p style={pageStyle.connected_url}>Phantom Wallet</p>
//         {Address?<p style={pageStyle.wallet_address}>
//          {Address.slice(0, 4)}...{Address.slice(-4)}</p>:""}
//         <p style={pageStyle.instruction_text}>
//           You're all set! Return to Arken bot to start making predictions.
//         </p>
//         <button 
//           style={pageStyle.disconnect_btn}
//          onClick="window.location.href='https://t.me/Arkenpredictionbot'"
//         >
//           Back to Arken Bot
//         </button>
//       </div>
//     </div>
//   )
// }

// const pageStyle = {
//   cmmn_bdy_mainwrp: {
//     minHeight: '100vh',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//         background: '#000',
//     padding: `${moderateScale(20)}px`,
//   },
//   wallet_connected_wrp: {
//     display: 'flex',
//     flexDirection: 'column',
//     alignItems: 'center',
//     justifyContent: 'center',
//     textAlign: 'center',
//     width: '100%',
//     maxWidth: `${moderateScale(400)}px`,
//     padding: `${moderateScale(40)}px ${moderateScale(20)}px`,
//   },
//    wallet_address: {
//     fontSize: `${moderateScale(14)}px`,
//     fontWeight: '400',
//     color: '#FFFFFF',
//     margin: '0',
//     marginBottom: `${moderateScale(30)}px`,
//     opacity: 0.85,
//     fontFamily: 'monospace',
//     backgroundColor: 'rgba(255, 255, 255, 0.15)',
//     padding: `${moderateScale(8)}px ${moderateScale(16)}px`,
//     borderRadius: `${moderateScale(20)}px`,
//     letterSpacing: '0.5px',
//   },
//   check_icon_wrp: {
//     width: `${moderateScale(80)}px`,
//     height: `${moderateScale(80)}px`,
//     borderRadius: '50%',
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: `${moderateScale(30)}px`,
//   },
//   check_icon: {
//     width: `${moderateScale(40)}px`,
//     height: `${moderateScale(40)}px`,
//   },
//   connected_title: {
//     fontSize: `${moderateScale(24)}px`,
//     fontWeight: '600',
//     color: '#FFFFFF',
//     margin: '0',
//     marginBottom: `${moderateScale(8)}px`,
//   },
//   connected_url: {
//     fontSize: `${moderateScale(18)}px`,
//     fontWeight: '500',
//     color: '#FFFFFF',
//     margin: '0',
//     marginBottom: `${moderateScale(40)}px`,
//   },
//   instruction_text: {
//     fontSize: `${moderateScale(13)}px`,
//     color: '#FFFFFF',
//     lineHeight: '1.5',
//     margin: '0',
//     marginBottom: `${moderateScale(30)}px`,
//     opacity: 0.9,
//     maxWidth: `${moderateScale(280)}px`,
//   },
//   disconnect_btn: {
//     backgroundColor: '#FFFFFF',
//     color: '#000',
//     fontSize: `${moderateScale(14)}px`,
//     fontWeight: '600',
//     padding: `${moderateScale(12)}px ${moderateScale(40)}px`,
//     borderRadius: `${moderateScale(8)}px`,
//     border: 'none',
//     cursor: 'pointer',
//     transition: 'all 0.2s ease',
//     boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
//   },
// };

// export default WalletConnect



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
      const phantomPubKey = params.get("phantom_encryption_public_key");
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


       const phantomSession = {
    publicKey: connectData.public_key,
    session: connectData.session,
    sharedSecret,
    nonce: bs58.decode(nonce),
  };

  // Derive dapp public key from the secret key so we can reuse it for signTransaction
  const dappKeyPairFromSecret = nacl.box.keyPair.fromSecretKey(dappSecretKey);

  const Jsondata=  JSON.stringify({
      publicKey: phantomSession.publicKey,
      session: phantomSession.session,
      sharedSecret: bs58.encode(sharedSecret),
      nonce: bs58.encode(phantomSession.nonce),
      dappPublicKey: bs58.encode(dappKeyPairFromSecret.publicKey)
    })
      const walletAddress = connectData.public_key;

      if (!walletAddress) {
        throw new Error("Wallet address missing");
      }

      setAddress(walletAddress);
      await verifyId(uniqueId, walletAddress,Jsondata);

    } catch (err) {
      console.error("Wallet verification error:", err);
      setErrorMsg(err.message || "Wallet verification failed");
      showErrorToast("Wallet verification failed");
    }
  };

  verifyWallet();
}, []);

  const verifyId = async (uniqueId, walletAddress,Jsondata) => {
    const payload = {
      uniqueId,
      connectedwalletName: "Phantom",
      connectedwalletAddress: walletAddress,
      connectedwalletStatus: true,
      Jsondata:Jsondata
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
        <p style={pageStyle.connected_url}>Phantom Wallet</p>

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