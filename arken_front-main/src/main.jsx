// // // import { StrictMode } from 'react'
// // // import { createRoot } from 'react-dom/client'
// // // import './index.css'
// // // import App from './App.jsx'
// // // createRoot(document.getElementById('root')).render(
// // //       <App />
// // // )

// // // import { StrictMode } from 'react'
// // // import { createRoot } from 'react-dom/client'
// // // import './index.css'
// // // import App from './App.jsx'

// // // // 1. Import Wagmi and TanStack Query
// // // import { WagmiProvider, createConfig, http } from 'wagmi'
// // // import { mainnet } from 'wagmi/chains'
// // // import { metaMask } from 'wagmi/connectors'
// // // import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// // // // 2. Create the QueryClient
// // // const queryClient = new QueryClient()

// // // // 3. Setup the Wagmi Config
// // // const config = createConfig({
// // //   chains: [mainnet],
// // //   connectors: [
// // //     metaMask({
// // //       dappMetadata: {
// // //         name: "Telegram Wallet App",
// // //         url: 'https://arken.blfdemo.online/',
// // //       },
// // //     }),
// // //   ],
// // //   transports: {
// // //     [mainnet.id]: http(),
// // //   },
// // // })

// // // createRoot(document.getElementById('root')).render(
// // //   <StrictMode>
// // //     {/* 4. Wrap App with both Providers */}
// // //     <WagmiProvider config={config}>
// // //       <QueryClientProvider client={queryClient}>
// // //         <App />
// // //       </QueryClientProvider>
// // //     </WagmiProvider>
// // //   </StrictMode>
// // // )

// // import { StrictMode, useMemo } from 'react';
// // import { createRoot } from 'react-dom/client';
// // import App from './App.jsx';

// // // EVM Imports
// // import { WagmiProvider, createConfig, http } from 'wagmi';
// // import { mainnet } from 'wagmi/chains';
// // import { walletConnect } from 'wagmi/connectors';
// // import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// // // Solana Imports
// // import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
// // import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
// // import { SolflareWalletAdapter, PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
// // import { clusterApiUrl } from '@solana/web3.js';

// // import '@solana/wallet-adapter-react-ui/styles.css';

// // const queryClient = new QueryClient();

// // // 1. Wagmi Config for MetaMask (EVM)
// // const wagmiConfig = createConfig({
// //   chains: [mainnet],
// //   connectors: [
// //     walletConnect({ 
// //       projectId: 'YOUR_WALLETCONNECT_PROJECT_ID', // Required for mobile
// //       showQrModal: true 
// //     })
// //   ],
// //   transports: { [mainnet.id]: http() },
// // });

// // function Root() {
// //   const endpoint = useMemo(() => clusterApiUrl('mainnet-beta'), []);
// //   // 2. Solana Adapters for Solflare and Phantom
// //   const wallets = useMemo(() => [
// //     new SolflareWalletAdapter(),
// //     new PhantomWalletAdapter()
// //   ], []);

// //   return (
// //     <WagmiProvider config={wagmiConfig}>
// //       <QueryClientProvider client={queryClient}>
// //         <ConnectionProvider endpoint={endpoint}>
// //           <WalletProvider wallets={wallets} autoConnect>
// //             <WalletModalProvider>
// //               <App />
// //             </WalletModalProvider>
// //           </WalletProvider>
// //         </ConnectionProvider>
// //       </QueryClientProvider>
// //     </WagmiProvider>
// //   );
// // }

// // createRoot(document.getElementById('root')).render(<Root />);


// // //METAMASK start
// // import { StrictMode } from 'react'
// // import { createRoot } from 'react-dom/client'
// // import './index.css'
// // import App from './App.jsx'

// // import { WagmiProvider, createConfig, http } from 'wagmi'
// // import { mainnet } from 'wagmi/chains'
// // import { walletConnect } from 'wagmi/connectors' // Import WalletConnect
// // import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// // const queryClient = new QueryClient()
// // const projectId = '287d42b489fce2f51cd3f5a9cfb6b549' 

// // const config = createConfig({
// //   chains: [mainnet],
// //   connectors: [
// //     walletConnect({ 
// //       projectId,
// //       showQrModal: true 
// //     }),
// //   ],
// //   transports: {
// //     [mainnet.id]: http(),
// //   },
// // })

// // createRoot(document.getElementById('root')).render(
// //   <StrictMode>
// //     <WagmiProvider config={config}>
// //       <QueryClientProvider client={queryClient}>
// //         <App />
// //       </QueryClientProvider>
// //     </WagmiProvider>
// //   </StrictMode>
// // )
// //METAMASK end

//sol correct
import { StrictMode, useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// EVM Imports (Existing)
import { WagmiProvider, createConfig, http } from 'wagmi'
import { mainnet,arbitrum } from 'wagmi/chains'
import { walletConnect } from 'wagmi/connectors'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// SOLANA IMPORTS (Add these)
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { SolflareWalletAdapter, PhantomWalletAdapter } from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from '@solana/web3.js'
import '@solana/wallet-adapter-react-ui/styles.css';
import { Buffer } from "buffer";
// import {
//   PhantomProvider,
//   useModal,
//   darkTheme,
//   usePhantom,
// } from "@phantom/react-sdk";
// import { AddressType } from "@phantom/browser-sdk";
const queryClient = new QueryClient()
const projectId = '287d42b489fce2f51cd3f5a9cfb6b549' 

const config = createConfig({
  chains: [mainnet,arbitrum],
  connectors: [
    walletConnect({ 
      projectId,
      showQrModal: true 
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
  },
})
window.Buffer = Buffer;
const SolanaRoot = () => {
  const endpoint = useMemo(() => clusterApiUrl('mainnet-beta'), []);

  const wallets = useMemo(() => [
    new SolflareWalletAdapter({
      // Your actual website URL
      appUrl: import.meta.env.VITE_FRONT_URL || 'https://arken.blfdemo.online',
      redirectLink: 'https://t.me/ArkenBot/app' 
    }),
    new PhantomWalletAdapter()
  ], []);
  
  return (
    <StrictMode>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          {/* ADDED SOLANA PROVIDERS HERE */}
          <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
              <WalletModalProvider>
                    <App />
              </WalletModalProvider>
            </WalletProvider>
          </ConnectionProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </StrictMode>
  )
}

createRoot(document.getElementById('root')).render(<SolanaRoot />)


//sol correct


// src/main.jsx
// import { useMemo } from 'react';
// import { createRoot } from 'react-dom/client';
// import App from './App.jsx';
// import './index.css';

// // EVM Imports
// import { WagmiProvider, createConfig, http } from 'wagmi';
// import { arbitrum, mainnet } from 'wagmi/chains'; // Added Arbitrum
// import { walletConnect } from 'wagmi/connectors';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// // SOLANA IMPORTS
// import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
// import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
// import { SolflareWalletAdapter, PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';

// import { clusterApiUrl } from '@solana/web3.js';
// import '@solana/wallet-adapter-react-ui/styles.css'; // Ensure styles are imported

// const queryClient = new QueryClient();
// const projectId = '287d42b489fce2f51cd3f5a9cfb6b549'; 

// // 1. Wagmi Config (EVM - Mainnet and Arbitrum)
// const wagmiConfig = createConfig({
//   chains: [mainnet, arbitrum], // Added arbitrum chain
//   connectors: [
//     walletConnect({ 
//       projectId,
//       showQrModal: true,
//       // Focus on speed by using only necessary URLs
//       options: { metadata: { name: "Arken DApp", url: 'https://arken.blfdemo.online/' } }
//     }),
//   ],
//   transports: {
//     [mainnet.id]: http(),
//     [arbitrum.id]: http(),
//   },
// });

// function RootProviders() {
//   // 2. Solana Configuration (using a fast RPC endpoint for low latency)
//   // Use a reliable, fast RPC endpoint, or stick with clusterApiUrl for simplicity
//   // const endpoint = 'https://api.mainnet-beta.solana.com'; // Or 
//     // const endpoint = useMemo(() => clusterApiUrl('mainnet-beta'), []);
//     const endpoint="https://mainnet.helius-rpc.com/?api-key=17d42dc8-08fc-4d52-955b-b0c083af31dc";
//   console.log(endpoint,"endpoint")
//   const wallets = useMemo(() => [
//     new SolflareWalletAdapter({
//       appUrl: 'https://arken.blfdemo.online/',
//       redirectLink: 'https://t.me/ArkenBot/app' 
//     }),
//     new PhantomWalletAdapter(),
//   ], []);
  
//   return (
//     <WagmiProvider config={wagmiConfig}>
//       <QueryClientProvider client={queryClient}>
//         <ConnectionProvider endpoint={endpoint}>
//           <WalletProvider wallets={wallets} autoConnect>
//             <WalletModalProvider>
//               <App />
//             </WalletModalProvider>
//           </WalletProvider>
//         </ConnectionProvider>
//       </QueryClientProvider>
//     </WagmiProvider>
//   );
// }

// createRoot(document.getElementById('root')).render(<RootProviders />);
