// import { createAppKit } from '@reown/appkit'
// import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
// import { SolanaAdapter } from '@reown/appkit-adapter-solana'

// import { mainnet, polygon } from 'wagmi/chains'
// import { clusterApiUrl } from '@solana/web3.js'

// export const projectId = '287d42b489fce2f51cd3f5a9cfb6b549'

// const metadata = {
//   name: "Arken Telegram Wallet",
//   description: "Connect your wallet to Arken",
//   url: "https://arken.blfdemo.online",
//   icons: [
//     "https://res.cloudinary.com/dqtdd1frp/image/upload/v1766562117/Arken_kbciym.png"
//   ]
// }

// const solanaNetwork = {
//   id: 'solana',
//   name: 'Solana',
//   network: 'solana',
//   nativeCurrency: {
//     name: 'Solana',
//     symbol: 'SOL',
//     decimals: 9
//   },
//   rpcUrls: {
//     default: { http: [clusterApiUrl('mainnet-beta')] }
//   }
// }

// const wagmiAdapter = new WagmiAdapter({
//   projectId,
//   networks: [mainnet, polygon],
//   metadata, 
//   ssr: false,
//   mobileLinks: ["metamask"],
//   features: {
//     auth: {
//       enabled: false
//     }
//   }
// })

// export const wagmiConfig = wagmiAdapter.wagmiConfig

// const solanaAdapter = new SolanaAdapter({
//   projectId,
//   networks: [solanaNetwork]
// })


// createAppKit({
//   projectId,

//   adapters: [wagmiAdapter, solanaAdapter],

//   networks: [mainnet, polygon, solanaNetwork],

//   themeMode: 'light',

//   themeVariables: {
//     '--w3m-accent': '#0E978C'
//   },

//   features: {
//     auth: {
//       enabled: false
//     }
//   }
// })
