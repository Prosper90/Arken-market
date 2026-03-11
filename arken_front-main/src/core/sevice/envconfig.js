export const env = {
    apiHost: import.meta.env.VITE_API_HOST || "https://arken.blfdemo.online:4000/",
    frontUrl: import.meta.env.VITE_FRONT_URL || "https://arken.blfdemo.online/",
    // exchangeApi: "https://skgcryparb.com:3030/",
    // apiHost: "https://skgcryparb.com:3030/",
    // frontUrl: "https://skgcryparb.com/",
// wallet_endpoint: "https://divine-wild-meme.solana-mainnet.quiknode.pro/5ba906d3420f66396e2be33ed12747873fdb1404/",
// wallet_endpoint: "https://api.devnet.solana.com",
wallet_endpoint: import.meta.env.VITE_SOL_RPC_URL || "https://mainnet.helius-rpc.com/?api-key=05031ac5-0873-42a5-bb11-1c124bb119b0", // mainnet
// wallet_endpoint: "https://api.testnet.solana.com", // testnet — uncomment for testnet testing
// usdt_mint_address:"Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", //usdtaddress

usdt_mint_address:"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", //usdc address

// usdt_mint_address:"CXk2AMBfi3TwaEL2468s6zP8xq9NxTXjp9gjMgzeUynM",//PYUSD
// usdt_mint_address:"EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS",
//  usdt_mint_address:"CG8Y75r1EPm2tedBczkkWyXcwZiiNKPYvDYNTFfC3ajY",
Admin_wallet:"26XdsNbokEqVEPcG8kokNvP8A6b3at2eBHA2qgUgk3N3", //solflare address
mint_address:"56g9bFshkZMV9zM1yswM75Hu2bwY8wLjbfSQGbtkv6qo",
Admin_wallet_ARB:'0xb96D7E7168f17a3315D171Dd2cF18Ce7E1a5E21C',

 USDC_ARB : "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", 
  ERC20_ABI : [{"inputs":[{"internalType":"address","name":"implementationContract","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"previousAdmin","type":"address"},{"indexed":false,"internalType":"address","name":"newAdmin","type":"address"}],"name":"AdminChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"implementation","type":"address"}],"name":"Upgraded","type":"event"},{"stateMutability":"payable","type":"fallback"},{"inputs":[],"name":"admin","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newAdmin","type":"address"}],"name":"changeAdmin","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"implementation","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newImplementation","type":"address"}],"name":"upgradeTo","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newImplementation","type":"address"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"upgradeToAndCall","outputs":[],"stateMutability":"payable","type":"function"}],
  metamakskProjectId:"292c7cfdbcff2eab9ef5a2ebe9050951",
   BOT_URL: import.meta.env.VITE_BOT_URL || "https://t.me/Arkenmarketbot",
   REDIRECTURL: (import.meta.env.VITE_BOT_URL || "https://t.me/Arkenmarketbot") + "?startapp=phantom",
   MINIMUM_MAITANNACE_ARB : 0.001,
   MINIMUM_MAITANNACE_SOL : 0.001
  };

