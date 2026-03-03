// // // // src/App.jsx
// // // import { useConnect, useAccount, useSwitchChain, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
// // // import { useWallet, useConnection } from '@solana/wallet-adapter-react';
// // // import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
// // // import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, clusterApiUrl } from '@solana/web3.js';
// // // import { TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync, createTransferInstruction } from '@solana/spl-token';
// // // import { useEffect, useState } from 'react';

// // // function App() {
// // //   // --- EVM Hooks (Wagmi) ---
// // //   const { connect, connectors, status, error } = useConnect();
// // //   const { address: evmAddress, chainId, isConnected: isEvmConnected } = useAccount();
// // //   const { chains, switchChain } = useSwitchChain();
// // //   const { writeContractAsync } = useWriteContract();
  
// // //   // --- Solana Hooks (Wallet Adapter) ---
// // //   const { connection } = useConnection();
// // //   const { publicKey: solPublicKey, connected: isSolConnected, sendTransaction } = useWallet();

// // //   const [evmTxHash, setEvmTxHash] = useState(null);
// // //   const [solTxHash, setSolTxHash] = useState(null);

// // //   // Your existing connection code for EVM (using WalletConnect connector)
// // //   const connectWalletConnect = () => {
// // //     const connector = connectors.find((c) => c.id === 'walletConnect');
// // //     if (connector) {
// // //       connect({ connector });
// // //     }
// // //   };

// // //   // Switch EVM chain to Arbitrum
// // //   const switchToArbitrum = () => {
// // //     // Arbitrum chainId is 42161
// // //     if (chainId !== 42161) {
// // //       switchChain({ chainId: 42161 });
// // //     }
// // //   };

// // //   // Perform EVM (Arbitrum) transfer (example: sending 0.001 ETH)
// // //   const handleEvmTransfer = async () => {
// // //     if (!isEvmConnected || chainId !== 42161) {
// // //       alert("Please connect to Arbitrum network first.");
// // //       return;
// // //     }
// // //     try {
// // //         const txHash = await writeContractAsync({
// // //             // Simple ETH transfer on Arbitrum doesn't need contract, just `sendTransaction` (not currently in useAccount)
// // //             // Example below is a generic contract interaction, for simple ETH transfer use a different wagmi hook/method.
// // //             // A more direct way to show value transfer via a placeholder:
// // //             // This requires a provider or signer which wagmi handles under the hood.
// // //             // Since `writeContractAsync` is for contracts, let's assume a simplified value transfer.
// // //             // For simple ETH send, you often need a client/signer hook not just writeContract.
// // //             // Let's stick to showing the function call structure:
// // //             address: '0xb96D7E7168f17a3315D171Dd2cF18Ce7E1a5E21C', // Replace with a real recipient
// // //             abi: [{
// // //                 "inputs": [{"internalType": "uint256","name": "amount","type": "uint256"}],
// // //                 "name": "deposit",
// // //                 "outputs": [],
// // //                 "stateMutability": "payable",
// // //                 "type": "function"
// // //             }],
// // //             functionName: 'deposit',
// // //             args: [1000000000000000], // Example amount in wei (0.001 ETH)
// // //             value: BigInt(1000000000000000), 
// // //         });
// // //         setEvmTxHash(txHash);
// // //         alert(`EVM Transaction sent: ${txHash}`);
// // //     } catch (err) {
// // //         console.error("EVM Transfer error:", err);
// // //         alert("EVM Transfer failed.");
// // //     }
// // //   };

// // //   // Perform Solana SOL transfer (optimized)
// // //   const handleSolTransfer = async (amount = 0.001) => {
// // //     if (!isSolConnected || !solPublicKey) {
// // //       alert("Please connect your Solana wallet.");
// // //       return;
// // //     }
// // //     try {
// // //       const recipientAddress = 'Ki2pMf2VZSnmFLcXVLykGfbUwfhyHKeymf2xvnH1aN5'; // Replace with a real recipient
// // //       const recipientPubKey = new PublicKey(recipientAddress);
      
// // //       const transaction = new Transaction().add(
// // //         SystemProgram.transfer({
// // //           fromPubkey: solPublicKey,
// // //           toPubkey: recipientPubKey,
// // //           lamports: amount * LAMPORTS_PER_SOL,
// // //         })
// // //       );

// // //       // Fetch latest blockhash for transaction validity (low latency optimization)
// // //       transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
// // //       transaction.feePayer = solPublicKey;

// // //       const signature = await sendTransaction(transaction, connection);
// // //       setSolTxHash(signature);
// // //       alert(`SOL Transaction sent: ${signature}`);
// // //       await connection.confirmTransaction(signature, 'processed'); // Wait for confirmation
// // //       console.log('SOL transaction confirmed:', signature);

// // //     } catch (err) {
// // //       console.error("SOL Transfer error:", err);
// // //       alert("SOL Transfer failed.");
// // //     }
// // //   };

// // //   // Perform Solana SPL-USDT transfer (optimized)
// // //   const handleSplTransfer = async (tokenMintAddress, amount) => {
// // //     if (!isSolConnected || !solPublicKey) {
// // //       alert("Please connect your Solana wallet.");
// // //       return;
// // //     }

// // //     try {
// // //       const mintPublicKey = new PublicKey(tokenMintAddress);
// // //       const recipientAddress = 'Ki2pMf2VZSnmFLcXVLykGfbUwfhyHKeymf2xvnH1aN5'; // Replace with a real recipient
// // //       const recipientPublicKey = new PublicKey(recipientAddress);

// // //       // Get associated token account addresses
// // //       const fromTokenAccount = getAssociatedTokenAddressSync(mintPublicKey, solPublicKey);
// // //       const toTokenAccount = getAssociatedTokenAddressSync(mintPublicKey, recipientPublicKey);

// // //       const transaction = new Transaction().add(
// // //         createTransferInstruction(
// // //           fromTokenAccount,
// // //           toTokenAccount,
// // //           solPublicKey,
// // //           amount * 1000000, // Assuming 6 decimal places for USDT
// // //           [],
// // //           TOKEN_PROGRAM_ID
// // //         )
// // //       );

// // //       transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
// // //       transaction.feePayer = solPublicKey;

// // //       const signature = await sendTransaction(transaction, connection);
// // //       alert(`SPL Transaction sent: ${signature}`);
// // //       await connection.confirmTransaction(signature, 'processed');
// // //       console.log('SPL transaction confirmed:', signature);

// // //     } catch (err) {
// // //       console.error("SPL Transfer error:", err);
// // //       alert("SPL Transfer failed.");
// // //     }
// // //   };

// // //   return (
// // //     <div className="App text-white">
// // //       <h1>Multi-Chain Wallet Integration (EVM & Solana)</h1>
// // //       <p>Using Wagmi (EVM) and Solana Wallet Adapter (SOL)</p>

// // //       {/* EVM Section */}
// // //       <section>
// // //         <h2>EVM Connection (Arbitrum/Mainnet)</h2>
// // //         {isEvmConnected ? (
// // //           <div>
// // //             <p>Connected EVM Address: {evmAddress}</p>
// // //             <p>Chain ID: {chainId} ({chains.find(c => c.id === chainId)?.name})</p>
// // //             <button onClick={switchToArbitrum}>Switch to Arbitrum</button>
// // //             <button onClick={handleEvmTransfer}>Send 0.001 ETH (Arbitrum Example)</button>
// // //           </div>
// // //         ) : (
// // //           <button onClick={connectWalletConnect}>Connect EVM Wallet (MetaMask)</button>
// // //         )}
// // //         {status === 'pending' && <p>Connecting...</p>}
// // //         {error && <p>EVM Connection Error: {error.message}</p>}
// // //       </section>

// // //       {/* Solana Section */}
// // //       <section>
// // //         <h2>Solana Connection (SOL/SPL)</h2>
// // //         <WalletMultiButton />
// // //         {isSolConnected && solPublicKey && (
// // //           <div>
// // //             <p>Connected Solana Public Key: {solPublicKey.toString()}</p>
// // //             <button onClick={() => handleSolTransfer(0.001)}>Send 0.001 SOL</button>
// // //             <button onClick={() => handleSplTransfer('Es9vMFrzaCERmJfrkykTjQpXKitnW4ityNCmpCdPNVsJ', 0.00001)}>
// // //               Send 0.00001 USDT (SPL)
// // //             </button>
// // //           </div>
// // //         )}
// // //       </section>
// // //     </div>
// // //   );
// // // }

// // // export default App;
// // // src/App.jsx
// // import { useSendTransaction } from 'wagmi';
// // import { parseEther } from 'viem';
// // import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, clusterApiUrl } from '@solana/web3.js';
// // import { useWallet, useConnection } from '@solana/wallet-adapter-react';
// // import { PhantomWalletName } from '@solana/wallet-adapter-phantom'; 
// // import { SolflareWalletName } from '@solana/wallet-adapter-solflare';
// // function App() {
// //   const { sendTransactionAsync: sendEvmTx } = useSendTransaction();
// //   const { connection } = useConnection();
// //   const { select,publicKey, sendTransaction,connected  } = useWallet();

// //   // --- ARBITRUM (EVM) HIGH SPEED TRANSFER ---
// //   const handleEvmTransfer = async () => {
// //     try {
// //       const tx = await sendEvmTx({
// //         to: '0xb96D7E7168f17a3315D171Dd2cF18Ce7E1a5E21C',
// //         value: parseEther('0.001'),
// //         chainId: 42161, // Force Arbitrum
// //       });
// //       alert(`Success: ${tx}`);
// //     } catch (e) { alert("Check if wallet is on Arbitrum"); }
// //   };

// //   // --- SOLANA (SOL) LOW LATENCY TRANSFER ---
// //   //  const handleSolTransfer = async () => {
// //   //   try {
// //   //     // FIX: Ensure a wallet is selected if not already connected
// //   //     if (!connected) {
// //   //       // You can default to Phantom or trigger a UI to let them select
// //   //       await select(SolflareWalletName); 
// //   //     }

// //   //     if (!publicKey) {
// //   //       alert("Please connect your wallet first.");
// //   //       return;
// //   //     }

// //   //     const recipient = new PublicKey('Ki2pMf2VZSnmFLcXVLykGfbUwfhyHKeymf2xvnH1aN5');
// //   //     const transaction = new Transaction().add(
// //   //       SystemProgram.transfer({
// //   //         fromPubkey: publicKey,
// //   //         toPubkey: recipient,
// //   //         lamports: 0.001 * LAMPORTS_PER_SOL,
// //   //       })
// //   //     );

// //   //     const { blockhash } = await connection.getLatestBlockhash('processed');
// //   //     transaction.recentBlockhash = blockhash;
// //   //     transaction.feePayer = publicKey;

// //   //     const signature = await sendTransaction(transaction, connection, {
// //   //       skipPreflight: true,
// //   //       maxRetries: 3
// //   //     });
      
// //   //     alert(`Sent: ${signature}`);
// //   //   } catch (err) {
// //   //     console.error("Selection/Transfer Error:", err);
// //   //   }
// //   // };
// //  const handleSolTransfer = async () => {
// //     try {
// //       // 1. Manually trigger selection if not connected
// //       if (!connected) {
// //         const metamaskWallet = wallets.find(w => w.adapter.name === 'MetaMask');
// //         if (metamaskWallet) {
// //           await select(metamaskWallet.adapter.name);
// //           return; // Wait for connection to complete
// //         }
// //       }

// //       if (!publicKey) return alert("Please connect MetaMask first!");

// //       const transaction = new Transaction().add(
// //         SystemProgram.transfer({
// //           fromPubkey: publicKey,
// //           toPubkey: new PublicKey('Ki2pMf2VZSnmFLcXVLykGfbUwfhyHKeymf2xvnH1aN5'),
// //           lamports: 0.001 * LAMPORTS_PER_SOL,
// //         })
// //       );

// //       // Low latency settings
// //       const { blockhash } = await connection.getLatestBlockhash('processed');
// //       transaction.recentBlockhash = blockhash;
// //       transaction.feePayer = publicKey;

// //       const signature = await sendTransaction(transaction, connection, {
// //         skipPreflight: true, // Speeds up the transaction popup
// //       });

// //       alert(`Success! Signature: ${signature}`);
// //     } catch (err) {
// //       console.error("Transfer Error:", err);
// //     }
// //   };


// //   // --- SOLANA (SPL-USDT) TRANSFER ---
// //   const handleSplTransfer = async () => {
// //     try {
// //       const MINT = new PublicKey('Es9vMFrzaCERmJfrkykTjQpXKitnW4ityNCmpCdPNVsJ');
// //       const DEST = new PublicKey('Ki2pMf2VZSnmFLcXVLykGfbUwfhyHKeymf2xvnH1aN5');

// //       const fromATA = getAssociatedTokenAddressSync(MINT, publicKey);
// //       const toATA = getAssociatedTokenAddressSync(MINT, DEST);

// //       const tx = new Transaction().add(
// //         createTransferInstruction(fromATA, toATA, publicKey, 0.00001 * 10**6)
// //       );

// //       const { blockhash } = await connection.getLatestBlockhash('finalized');
// //       tx.recentBlockhash = blockhash;

// //       const sig = await sendTransaction(tx, connection);
// //       alert(`USDT Sent: ${sig}`);
// //     } catch (e) { alert("Check if recipient has a USDT account"); }
// //   };

// //   return (
// //     <div className="flex flex-col gap-4 p-4">
// //       <button onClick={handleEvmTransfer} className="bg-blue-500 p-2">Send Arbitrum ETH</button>
// //       <button onClick={handleSolTransfer} className="bg-purple-500 p-2">Send SOL</button>
// //       <button onClick={handleSplTransfer} className="bg-green-500 p-2">Send SPL USDT</button>
// //     </div>
// //   );
// // }
// // export default App;

// import React from 'react'
// import Solflare from '@solflare-wallet/sdk';
//  const solflare = new Solflare({ network: 'mainnet-beta' });
//  function wallet() {

//   const connectWallet = async  ()=> { 
//     try { 
//       console.log("DSFDSF")
//       await solflare.connect().then((res)=>console.log(res)).catch((err)=>console.log(err,"==")) 
//       console.log(solflare,"solflare")
//       if (solflare.connected) {
//          const address = solflare.publicKey.toString(); console.log("Connected wallet address:", address);
//   console.log(address,"address")
//   localStorage.setItem("dfdsfs",address)
//   localStorage.setItem("telegramId",telegramUser.telegramId)
//   // 👉 Show the address in your app document.
//       // 
//       // getElementById("walletAddress").innerText = address; 
//       // 👉 Redirect to another page in your Mini App 
//       // window.location.href = "/dashboard?address=" + address; // Replace "/dashboard" with the route in your app
//  disconnectWallet();
//        }
//        } catch (err) { console.error("Wallet connection failed:", err); } }

// const  disconnectWallet= () =>{ 
//   // document.getElementById("walletAddress").innerText = ""; 
//    solflare.disconnect(); 
//    console.log(localStorage.getItem("dfdsfs"))
//    alert(window.location.href,"window.location.href")
//   window.location.href = "/markets"; // redirect to login page
//    }
//   return (
//     <div>
//       <button onClick={connectWallet}>🔗 Connect Wallet</button> <button onClick={disconnectWallet}>❌ Disconnect</button>
//     </div>
//   )
// }
// export default wallet;
import React, { useState } from "react";
import { ethers, Contract, parseUnits } from "ethers";
import EthereumProvider from "@walletconnect/ethereum-provider";
import {env} from "../../core/sevice/envconfig"
/* ---------------- CONFIG ---------------- */

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

/* ---------------- COMPONENT ---------------- */

let wcProvider; // reuse connection

export default function ArbitrumUSDC() {
  const [wallet, setWallet] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  /* -------- CONNECT WALLET -------- */
const connectWallet = async () => {
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
      alert(" switch to Arbitrum network Sucess");

    } catch (err) {
      alert("Please switch to Arbitrum network");
      throw err;
    }
  }

  // ✅ NOW create signer
  const signer = await provider.getSigner(accounts[0]);

  // 🔍 Validate signer
  const address = await signer.getAddress();
  setWallet(address);

  return signer;
};


  /* -------- SEND USDC -------- */
  const sendUSDC = async () => {
    try {
      if (!amount || Number(amount) <= 0) {
        alert("Enter valid amount");
        return;
      }

      setLoading(true);

      const signer = await connectWallet();
       alert(signer)
      // Network check
      const network = await signer.provider.getNetwork();
       alert(network.chainId)
      if (network.chainId !== 42161n) {
        alert("Please switch to Arbitrum network");
        setLoading(false);
        return;
      }

       alert(network)

      const usdc = new Contract(USDC_ARB, ERC20_ABI, signer);

       alert(usdc)
      const value = parseUnits(amount.toString(), 6);

       alert(value)
      // Balance check
      // const balance = await usdc.balanceOf(wallet);
      //  alert(balance)

      // if (balance < value) {
      //   alert("Insufficient USDC balance");
      //   setLoading(false);
      //   return;
      // }

      const tx = await usdc.transfer(ADMIN_WALLET, value);

      await tx.wait();
       alert(tx)
      alert("USDC Transfer Successful");
      setAmount("");
    } catch (err) {
      console.error(err);
      alert(err.reason || err.message || "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div style={{ padding: 20 }}>
      <h3>Telegram Mini App – Arbitrum USDC</h3>

      <p>
        Wallet:{" "}
        {wallet
          ? wallet.slice(0, 6) + "..." + wallet.slice(-4)
          : "Not Connected"}
      </p>
       {wallet
          ?""
          : 
<button onClick={connectWallet}>connectWallet</button>}
      <input
        type="number"
        placeholder="Enter USDC amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{ width: "100%", padding: 10 }}
      />

      <button
        onClick={sendUSDC}
        disabled={loading}
        style={{
          width: "100%",
          marginTop: 10,
          padding: 12,
          background: "#4f46e5",
          color: "white",
          border: "none",
          borderRadius: 6,
        }}
      >
        {loading ? "Processing..." : "Send USDC"}
      </button>
    </div>
  );
}
