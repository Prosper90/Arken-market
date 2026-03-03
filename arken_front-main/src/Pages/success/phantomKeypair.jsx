// import nacl from "tweetnacl";
// import bs58 from "bs58";
// import { useEffect,useState } from "react";
// let keypair = null;
// import { postMethod } from "../../core/sevice/common.api";
// import apiService from "../../core/sevice/detail";
// function GetDappKeyPair() {

    
//      useEffect(() => {
//       // if (!telegramUser?.telegramId) return;
    
//       getUserDetails();
    
//       const intervalId = setInterval(() => {
//         getUserDetails();
//       }, 5000);
    
//       return () => clearInterval(intervalId);
//     }, []);
//     // }, [telegramUser?.telegramId]);
    
//      const [phantomSession,setPhantomSession]=useState();
//      console.log(phantomSession,"phantomSession")
//       const getUserDetails = async () => {
//       try {
//         // if (!telegramUser?.telegramId) return;
//     //   alert("check user details====");
//         const resp = await postMethod({
//           apiUrl: apiService.getUserDetails,
//           payload: { telegramId: telegramUser?.telegramId||"5100502824"},
//         }); 
//         console.log(resp,"===resp")
    
//         if (resp.success && resp.data) {
//           console.log(resp.data,"=========")
//           setUserWallet({
//             isConnected: resp.data.wallet?.isConnected || false,
//             walletAddress: resp.data.wallet?.walletAddress || "",
//             walletName: resp.data.wallet?.walletName || "",
//             uniqueId: resp.data.uniqueId || "",
//           });
//           // setPhantomSession(JSON.parse(resp?.data?.
//           // jsondata))
    
//           const parsed = JSON.parse(resp?.data?.
//            jsonData);
    
//       setPhantomSession({
//         ...parsed,
//         sharedSecret: bs58.decode(parsed.sharedSecret),
//         nonce: bs58.decode(parsed.nonce)
//       });
//         } else {
//           console.error(resp.message || "Failed to fetch user details");
//         }
//       } catch (error) {
//         console.error("Error fetching user details:", error);
//       }
//     };
    
    
//   if (keypair) return keypair;

//   const stored = localStorage.getItem("phantom_dapp_keypair");

//   if (stored) {
//     const parsed = JSON.parse(stored);

//     keypair = {
//       publicKey: bs58.decode(parsed.publicKey),
//       secretKey: bs58.decode(parsed.secretKey)
//     };

//     return keypair;
//   }

//   const kp = nacl.box.keyPair();
//   console.log(kp,"---")
//   localStorage.setItem(
//     "phantom_dapp_keypair",
//     JSON.stringify({
//       publicKey: bs58.encode(kp.publicKey),
//       secretKey: bs58.encode(kp.secretKey)
//     })
//   );

//   keypair = kp;
//   return kp;
// }

// export default  GetDappKeyPair;

// // import { useState, useEffect } from "react";
// // import nacl from "tweetnacl";
// // import bs58 from "bs58";
// // import { postMethod } from "../../core/sevice/common.api";
// // import apiService from "../../core/sevice/detail";
// // import { useTelegramUser } from "../../context/TelegramUserContext";

// // // Global cache for keypair
// // let dappKeypairCache = null;

// // const usePhantomSession = () => {
// //       const { telegramUser } = useTelegramUser();
    
// //   const [phantomSession, setPhantomSession] = useState(null);
// //   const [userWallet, setUserWallet] = useState({
// //     isConnected: false,
// //     walletAddress: "",
// //     walletName: "",
// //     uniqueId: "",
// //   });
// //   const [dappKeyPair, setDappKeyPair] = useState(null);

// //   // Get or create dapp keypair
// //   const getDappKeyPair = () => {
// //     if (dappKeypairCache) return dappKeypairCache;

// //     const stored = localStorage.getItem("phantom_dapp_keypair");

// //     if (stored) {
// //       const parsed = JSON.parse(stored);
// //       dappKeypairCache = {
// //         publicKey: bs58.decode(parsed.publicKey),
// //         secretKey: bs58.decode(parsed.secretKey),
// //       };
// //       return dappKeypairCache;
// //     }

// //     // Create new keypair
// //     const kp = nacl.box.keyPair();
// //     localStorage.setItem(
// //       "phantom_dapp_keypair",
// //       JSON.stringify({
// //         publicKey: bs58.encode(kp.publicKey),
// //         secretKey: bs58.encode(kp.secretKey),
// //       })
// //     );

// //     dappKeypairCache = kp;
// //     return kp;
// //   };

// //   // Fetch user details and phantom session
// //   const getUserDetails = async () => {
// //     try {
// //       const resp = await postMethod({
// //         apiUrl: apiService.getUserDetails,
// //         payload: { telegramId: telegramUser?.telegramId || "5100502824" },
// //       });

// //       if (resp.success && resp.data) {
// //         setUserWallet({
// //           isConnected: resp.data.wallet?.isConnected || false,
// //           walletAddress: resp.data.wallet?.walletAddress || "",
// //           walletName: resp.data.wallet?.walletName || "",
// //           uniqueId: resp.data.uniqueId || "",
// //         });

// //         // Parse and decode phantom session
// //         if (resp.data.jsonData) {
// //           const parsed = JSON.parse(resp.data.jsonData);
// //           setPhantomSession({
// //             publicKey: parsed.publicKey,
// //             session: parsed.session,
// //             sharedSecret: bs58.decode(parsed.sharedSecret),
// //             nonce: bs58.decode(parsed.nonce),
// //           });
// //         }
// //       } else {
// //         console.error(resp.message || "Failed to fetch user details");
// //       }
// //     } catch (error) {
// //       console.error("Error fetching user details:", error);
// //     }
// //   };

// //   useEffect(() => {
// //     // Initialize dapp keypair
// //     const keypair = getDappKeyPair();
// //     setDappKeyPair(keypair);

// //     // Fetch user details
// //     getUserDetails();

// //     // Poll every 5 seconds
// //     const intervalId = setInterval(() => {
// //       getUserDetails();
// //     }, 5000);

// //     return () => clearInterval(intervalId);
// //   }, [telegramUser?.telegramId]);

// //   return {
// //     phantomSession,
// //     userWallet,
// //     dappKeyPair,
// //     refreshUserDetails: getUserDetails,
// //   };
// // };

// // export default usePhantomSession;
import React from 'react'

export default function phantomKeypair() {
  return (
    <div>
      
    </div>
  )
}
