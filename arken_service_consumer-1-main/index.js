require('dotenv').config();
const express = require('express');
const amqp = require('amqplib');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { connectRabbit } = require('./rabbit');
const { startAuthConsumer, setDepositSuccessCallback } = require('./consumers/auth.consumer');
const key = require("./config/key");
const User = require("./models/users");
const Market = require("./models/markets");
const PolyMarket = require("./models/polymarket");
const connectDB = require("./config/db");
const TelegramBot = require("node-telegram-bot-api");
require('./cronresolution');
const userWalletDB = require("./models/userWallet");
const currencyDB = require("./models/currency");
const TelegramGroup = require("./models/telegramGroup");
const userPublicWalletModel = require("./models/publicWallet");
const common =require("./utils/common")
const { creat_new_wallet } = require("./services/auth.service");
const http = require("http");
let server = "";
const fs = require("fs");
const https = require("https");
const { Keypair } = require("@solana/web3.js");
const bs58 = require("bs58").default;
const { Wallet } = require("ethers");
const app = express();
// app.use(express.json());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
connectDB();
const PAGE_SIZE = 6; 
const SEARCH_PAGE_SIZE = 6;

const BOT_TOKEN = process.env.BOT_TOKEN;
const secretKey = process.env.JWT_TOKEN_SECRET; 

const corsPath = {
  origin: function (origin, callback) {
    try {
      if (origin && key.WHITELISTURL.indexOf(origin) > -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    } catch (error) {
      console.log(error, "cors Error");
    }
  },
};

app.use(cors(corsPath));


function generateJwt(telegramId, groupId, betId) {
  return jwt.sign(
    {
      telegramId,
      groupId,
      betId,
    },
    secretKey,
    { expiresIn: '5m' } 
  );
}


function createArbWallet() {
  const wallet = Wallet.createRandom();
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
    network: "EVM"
  };
}

// SOLANA
function createSolWallet() {
  const keypair = Keypair.generate();
  return {
    address: keypair.publicKey.toBase58(),
    privateKey: bs58.encode(keypair.secretKey),
    network: "SOL"
  };
}

// createWallets() removed — wallets are now created explicitly by users
// via bot buttons (create_sol_wallet / create_arb_wallet) or via the mini-app.
// Both paths write to userPublicWallet, the single source of truth.


async function storeTelegramUser(msg, referrerId = null) {
  try {
    const telegramId = msg.from.id;
    const firstName = msg.from.first_name || "";
    const username = msg.from.username || firstName;

    let user = await User.findOne({ telegramId });

    if (!user) {
      const referralCode = `REF${telegramId}`;
      user = await User.create({
        telegramId,
        username,
        firstName,
        referralCode,
        referredBy: referrerId || null,
      });

      // Record referral relationship
      if (referrerId && referrerId !== telegramId) {
        const Referral = require("./models/referral");
        await Referral.create({
          referrerId,
          referredUserId: telegramId,
          source: "link",
        }).catch(() => {}); // ignore duplicate key if already exists
      }
    }

    return user;
  } catch (error) {
    console.error("Store Telegram User Error:", error);
    return null;
  }
}


function getCategoryIcon(category = "") {
  switch (category.toLowerCase()) {
    case "crypto":
      return "🪙";

    case "sports":
      return "⚽";

    case "politics":
      return "🏛️";

    case "geopolitics":
      return "🌍";

    case "finance":
      return "💰";

    case "economy":
      return "📉";

    case "worldevents":
      return "🌐";

    case "technology":
      return "💻";

    case "popculture":
      return "🎬";

    case "climateandscience":
      return "🌱";

    case "other":
      return "📦";

    default:
      return "📊";
  }
}


let bot;

// Helper: edit a message whether it has text or media caption.
async function editMsgAny(chatId, messageId, text, opts) {
  try {
    await bot.editMessageText(text, { chat_id: chatId, message_id: messageId, ...opts });
  } catch (e) {
    if (e.message && e.message.includes("there is no text")) {
      await bot.editMessageCaption(text, { chat_id: chatId, message_id: messageId, ...opts });
    } else if (!e.message || !e.message.includes("message is not modified")) {
      throw e;
    }
  }
}

// async function initializeTelegramBot() {
//   try {
//     console.log("🚀 Initializing Telegram bot (POLLING MODE)...");

//     bot = new TelegramBot(BOT_TOKEN, { polling: true });

//     console.log("✅ Telegram bot initialized with polling");

//     bot.onText(/\/start/, async (msg) => {
//       const chatId = msg.chat.id;

//       await storeTelegramUser(msg);

//       const webAppUrl = `${process.env.MINI_APP_URL || "https://arken.blfdemo.online"}/?v=3&telegramId=${chatId}`;

//       bot.sendPhoto(
//         chatId,
//         "https://res.cloudinary.com/dqtdd1frp/image/upload/v1765269718/_group__nwyhgf.webp",
//         {
//           caption: `🚀 *Welcome to Prediction Trading Platform!*

// ✅ Connect your wallet  
// ✅ Fund your account  
// ✅ Start placing predictions  

// 👇 Click below to get started`,
//           parse_mode: "Markdown",
//           reply_markup: {
//             inline_keyboard: [[
//               {
//                 text: "🔗 Connect Wallet",
//                 web_app: { url: webAppUrl }
//               }
//             ]]
//           }
//         }
//       );
//     });

//     bot.on("my_chat_member", async (msg) => {
//       try {
//         const chat = msg.chat;
//         const newStatus = msg.new_chat_member.status;

//         if (newStatus === "administrator" && chat.type !== "private") {
//           const groupId = chat.id;
//           const groupTitle = chat.title;
//           const groupOwnerId = msg.from.id;

//           const exists = await TelegramGroup.findOne({ groupId });

//           if (!exists) {
//             await TelegramGroup.create({
//               groupId,
//               groupTitle,
//               groupOwnerId,
//               commissionPercent: 5,
//               bettingEnabled: false,
//               botIsAdmin: true,
//             });

//             bot.sendMessage(
//               groupId,
//               "✅ Bot activated!\nAdmin can enable betting using /enablebets"
//             );
//           }
//         }
//       } catch (err) {
//         console.error("Group store error:", err.message);
//       }
//     });

//     bot.onText(/\/enablebets/, async (msg) => {
//       const groupId = msg.chat.id;
//       const userId = msg.from.id;

//       const group = await TelegramGroup.findOne({ groupId });
//       if (!group) return;

//       if (group.groupOwnerId !== userId) {
//         return bot.sendMessage(groupId, "❌ Only group owner can enable betting");
//       }

//       group.bettingEnabled = true;
//       await group.save();

//       bot.sendMessage(groupId, "🎯 Betting enabled in this group!");
//     });


// // bot.onText(/\/bets/, async (msg) => {
// //   try {
// //     const groupId = msg.chat.id;
// //     const telegramId = msg.from.id;

// //     const group = await TelegramGroup.findOne({ groupId });
// //     if (!group || !group.bettingEnabled) {
// //       return bot.sendMessage(groupId, "❌ Betting is not enabled in this group");
// //     }
// // const limit = 20;

// //     await Market.updateMany(
// //       { endDate: { $lt: new Date() }, active: true },
// //       { $set: { active: false } }
// //     );

// //     await PolyMarket.updateMany(
// //       { endDate: { $lt: new Date() }, active: true },
// //       { $set: { active: false } }
// //     );

// //     const manualMarkets = await Market.find({
// //       active: true,
// //       endDate: { $gte: new Date() }
// //     })
// //       .sort({ createdAt: -1 })
// //       .limit(limit)
// //       .lean();

// //     const taggedManualMarkets = manualMarkets.map((item) => ({
// //       ...item,
// //       source: "manual",
// //     }));

// //     const manualCount = taggedManualMarkets.length;
// //     const remaining = limit - manualCount;

// //     let polymarkets = [];
// //     if (remaining > 0) {
// //       polymarkets = await PolyMarket
// //         .find({
// //           active: true,
// //           closed: false,
// //           endDate: { $gte: new Date() }
// //         })
// //         .sort({ createdAt: -1 })
// //         .limit(remaining)
// //         .lean();
// //     }

// //     const polymarketWithChance = polymarkets.map((item) => {
// //       let outcomes = item.outcomes;
// //       if (Array.isArray(outcomes) && typeof outcomes[0] === "string") {
// //         try { outcomes = JSON.parse(outcomes[0]); } catch {}
// //       }

// //       let outcomePrices = item.outcomePrices;
// //       if (Array.isArray(outcomePrices) && typeof outcomePrices[0] === "string") {
// //         try { outcomePrices = JSON.parse(outcomePrices[0]); } catch {}
// //       }

// //       let chancePercents = null;
// //       if (Array.isArray(outcomePrices) && outcomePrices.length >= 2) {
// //         chancePercents = outcomePrices.map((p) => Number((Number(p) * 100).toFixed(2)));
// //       } else if (
// //         typeof item.yesPool === "number" &&
// //         typeof item.noPool === "number" &&
// //         item.yesPool + item.noPool > 0
// //       ) {
// //         const total = item.yesPool + item.noPool;
// //         chancePercents = [
// //           Number(((item.yesPool / total) * 100).toFixed(2)),
// //           Number(((item.noPool / total) * 100).toFixed(2)),
// //         ];
// //       } else {
// //         chancePercents = [50, 50];
// //       }

// //       return {
// //         ...item,
// //         outcomes,
// //         outcomePrices,
// //         chancePercents,
// //         source: "poly",
// //       };
// //     });

// //     const merged = [...taggedManualMarkets, ...polymarketWithChance];

// //     const keysToKeep = [
// //       "_id","question","description","tags","image","startDate","conditionId",
// //       "endDate","liquidity","minimumLiquidity","estimatedNetworkFee",
// //       "totalLiquidity","totalDeduction","outcomes","outcomePrices","chancePercents",
// //       "bestBid","bestAsk","resolution","currency","active","category","closed",
// //       "archived","slug","specifyId","acceptingOrders","events","source",
// //     ];

// //     const finalData = merged.map((item) => {
// //       const filtered = {};
// //       keysToKeep.forEach((k) => { if(item[k] !== undefined) filtered[k] = item[k]; });
// //       return filtered;
// //     });

// //     if (!finalData.length) {
// //       return bot.sendMessage(groupId, "📭 No active bets available");
// //     }

// //     for (const bet of finalData) {
// //       const token = generateJwt(telegramId, groupId, bet._id);
// //    const webAppUrl = `https://arken.blfdemo.online/market-details/${bet._id}?token=${token}`;
  
// //       let text = `📊 *${bet.question}*\n`;

// //       if (bet.outcomes?.length) {
// //         text += `Options: ${bet.outcomes.join(" / ")}\n`;
// //       }

// //       const replyMarkup = {
// //         inline_keyboard: [[
// //           {
// //             text: "👉 Place Bet",
// //             url: webAppUrl
// //           }
// //         ]]
// //       };


// //       await bot.sendMessage(groupId, text, {
// //         parse_mode: "Markdown",
// //         reply_markup: replyMarkup
// //       });
// //     }

// //   } catch (err) {
// //     console.error("/bets error:", err);
// //     bot.sendMessage(msg.chat.id, "❌ Failed to load bets");
// //   }
// // });



//  bot.onText(/\/bets/, async (msg) => {
//       const groupId = msg.chat.id;

//       const group = await TelegramGroup.findOne({ groupId });
//       if (!group || !group.bettingEnabled) {
//         return bot.sendMessage(groupId, "❌ Betting is not enabled in this group");
//       }

//       bot.sendMessage(groupId, "📊 *Select Bet Category*", {
//         parse_mode: "Markdown",
//         reply_markup: {
//           inline_keyboard: [
//             [
//               { text: "📋 All", callback_data: "bets_all" },
//               { text: "🪙 Crypto", callback_data: "bets_crypto" },
//               { text: "📦 Others", callback_data: "bets_others" }
//             ]
//           ]
//         }
//       });
//     });


//     bot.on("callback_query", async (query) => {
//       try {
//         const groupId = query.message.chat.id;
//         const telegramId = query.from.id;
//         const action = query.data;

//         let categoryFilter = {};
//         if (action === "bets_crypto") categoryFilter.category = "Crypto";
//         if (action === "bets_others") categoryFilter.category = "Other";

//         const limit = 20;

//         await Market.updateMany(
//           { endDate: { $lt: new Date() }, active: true },
//           { $set: { active: false } }
//         );

//         await PolyMarket.updateMany(
//           { endDate: { $lt: new Date() }, active: true },
//           { $set: { active: false } }
//         );

//         const manualMarkets = await Market.find({
//           active: true,
//           endDate: { $gte: new Date() },
//           ...categoryFilter
//         }).sort({ createdAt: -1 }).limit(limit).lean();

//         const taggedManualMarkets = manualMarkets.map((item) => ({
//           ...item,
//           source: "manual",
//         }));

//         let polymarkets = await PolyMarket.find({
//           active: true,
//           closed: false,
//           endDate: { $gte: new Date() },
//           ...categoryFilter
//         }).sort({ createdAt: -1 }).limit(limit).lean();

//         const merged = [...taggedManualMarkets, ...polymarkets];

//         if (!merged.length) {
//           bot.answerCallbackQuery(query.id);
//           return bot.sendMessage(groupId, "📭 No bets found");
//         }

//         for (const bet of merged) {
//           const token = generateJwt(telegramId, groupId, bet._id);
//           const webAppUrl = `https://arken.blfdemo.online/market-details/${bet._id}?token=${token}`;

//           let text = `📊 *${bet.question}*\n`;
//           if (bet.outcomes?.length) {
//             text += `Options: ${bet.outcomes.join(" / ")}\n`;
//           }

//           await bot.sendMessage(groupId, text, {
//             parse_mode: "Markdown",
//             reply_markup: {
//               inline_keyboard: [[
//                 { text: "👉 Place Bet", url: webAppUrl }
//               ]]
//             }
//           });
//         }

//         bot.answerCallbackQuery(query.id);
//       } catch (err) {
//         console.error("Callback error:", err);
//       }
//     });

//     return bot;
//   } catch (error) {
//     console.error("❌ Telegram bot initialization error:", error);
//     throw error;
//   }
// }


const CRYPTO_MAP = {
  BTC: ["bitcoin", "btc", "satoshi", "btc price", "bitcoin price"],
  ETH: ["ethereum", "eth", "eth 2.0", "ethereum price", "ether"],
  SOL: ["solana", "sol", "sol price"],
  DOGE: ["dogecoin", "doge", "doge price"],
  SHIB: ["shiba", "shib", "shiba inu"],
  XRP: ["xrp", "ripple", "ripple coin", "xrp price"],
  ADA: ["cardano", "ada", "ada price", "cardano ada"],
  BNB: ["bnb", "binance", "binance coin", "bnb price"],
  MATIC: ["matic", "polygon", "polygon matic", "matic price"],
  AVAX: ["avax", "avalanche", "avax price"],
  LINK: ["chainlink", "link", "chainlink link", "link price"],
  DOT: ["polkadot", "dot", "polkadot dot", "dot price"],
  ARB: ["arbitrum", "arb", "arbitrum token", "arb price"],
  OP: ["optimism", "op", "optimism token", "op price"],
  LTC: ["litecoin", "ltc", "litecoin ltc", "ltc price"],
  UNI: ["uniswap", "uni", "uniswap uni", "uni price"],
  AAVE: ["aave", "aave token", "aave price"],
  SOLANA: ["solana", "sol", "solana price"]
};

const SPORTS_SUBCATEGORIES = {
  Football: ["football","soccer","premier league","la liga","serie a","bundesliga","champions league","uefa","fifa","mls"],
  Cricket: ["cricket","icc","ipl","cricket world cup"],
  Basketball: ["nba","nba finals","ncaab"],
  AmericanFootball: ["nfl","super bowl","ncaaf"],
  Tennis: ["tennis","wimbledon","roland garros","us open","australian open","grand slam"],
  Motorsports: ["f1","formula 1","nascar","indycar"],
  Hockey: ["nhl","stanley cup"],
  Esports: ["esports","dota","league of legends","valorant","csgo"],
  BoxingMMA: ["boxing","ufc","mma","wrestling"],
  Golf: ["golf","pga","masters","ryder cup"],
  Rugby: ["rugby","rugby world cup"]
};

const POLITICS_SUBCATEGORIES = {
  USElections: ["us election","biden","trump","midterms","primaries"],
  WarConflict: ["gaza","israel","ukraine","russia","war","ceasefire"],
  Government: ["congress","senate","white house","cabinet","government"]
};

const FINANCE_SUBCATEGORIES = {
  Stocks: ["stock","stocks","nasdaq","dow","s&p","sp 500"],
  Rates: ["interest rate","rate hike","rate cut","yield","treasury"],
  Commodities: ["gold","silver","oil","brent","wti"],
  Forex: ["usd","dollar","euro","yen","yuan"]
};

const TECHNOLOGY_SUBCATEGORIES = {
  AI: ["ai","artificial intelligence","machine learning","llm","gpt","chatgpt","gemini","claude","anthropic","xai","grok","deepseek","mistral","moonshot"],
  BigTech: ["google","alphabet","apple","microsoft","meta","amazon","nvidia","tesla","oracle","baidu","alibaba","meituan","big tech"],
  Space: ["spacex","starlink","mars","rocket","launch","space mission","spacex ipo","spacex ticker","moon","satellite","astronaut"],
  MobileApps: ["app store","apple app store","google play","ios","android","tiktok","threads","capcut","temu","paramount+","mobile app"],
  IPOs: ["ipo","ipos","kraken ipo","discord ipo","anthropic ipo","openai ipo","valuation","market cap"],
  Semiconductors: ["gpu","chip","chips","semiconductor","nvda","data center","datacenter","supercomputer"],
  Biotech: ["fda","drug","approval","clinical trial","biotech","pharma","medicine","retatrutide"],
  Robotics: ["robot","robotics","autonomous","self driving","full self driving","tesla fsd"],
  Quantum: ["quantum","quantum computing"],
  SocialMedia: ["youtube","twitter","x (twitter)","x.com","podcast","all-in podcast"]
};

const WORLD_EVENTS_SUBCATEGORIES = {
  Elections: ["election","vote","referendum","campaign","president","prime minister","mayoral","parliament","senate","congress"],
  WarConflict: ["war","conflict","invasion","airstrike","missile","military","occupation","troops","offensive","defensive","ceasefire"],
  Diplomacy: ["summit","treaty","agreement","peace talks","negotiation","diplomacy"],
  Protests: ["protest","demonstration","unrest"],
  Sanctions: ["sanctions","embargo","blockade"],
  Health: ["pandemic","covid","variant","outbreak","healthcare"],
  ClimateEnergy: ["climate","environment","oil","energy","trade route","shipping"],
  HumanRights: ["human rights","civil rights","freedom","censorship","asylum","refugee"],
  Awards: ["nobel","nobel peace prize","olympics","winter olympics"]
};

const GEOPOLITICS_SUBCATEGORIES = {
  MiddleEast: ["israel","gaza","palestine","iran","lebanon","hezbollah","hamas","west bank","yemen","syria","middle east"],
  Europe: ["russia","ukraine","eu","europe","nato","balkans"],
  AsiaPacific: ["china","taiwan","north korea","south korea","south china sea","asean","japan"],
  Americas: ["usa","united states","venezuela"],
  Africa: ["sudan","somalia","ethiopia","african union"],
  WarSecurity: ["war","military","invasion","missile","nuclear","weapons","drone","attack","bombing"],
  SanctionsDiplomacy: ["sanctions","embargo","treaty","alliance","diplomacy"],
  Energy: ["oil","gas","pipeline","opec"],
  Cyber: ["cyber attack","espionage"]
};

const POPCULTURE_SUBCATEGORIES = {
  Music: ["song","album","artist","spotify","apple music","grammys","billboard","singer","rapper"],
  Movies: ["movie","movies","film","box office","oscars","academy awards","bafta","marvel","dc","disney"],
  TVShows: ["tv show","series","season","netflix","hbo","paramount","amazon prime","apple tv"],
  Celebrities: ["celebrity","celebrities","actor","actress","famous"],
  Gaming: ["gta","gta vi","grand theft auto","steam","valve"],
  SocialMedia: ["youtube","youtuber","mrbeast","tiktok","trend","viral","trending"],
  Awards: ["awards","red carpet","nominee","winner"],
  Legal: ["court","trial","lawsuit"]
};

const CLIMATE_SCIENCE_SUBCATEGORIES = {
  NaturalDisasters: ["earthquake","hurricane","tsunami","volcano","wildfire","flood","drought","heatwave"],
  ClimateChange: ["climate","climate change","global warming","sea level rise","glacier melt","ozone","environment"],
  Space: ["asteroid","meteor","space","mars","moon","satellite","astronaut","space telescope","astronomy","exoplanet","comet"],
  Pandemics: ["pandemic","outbreak","avian flu","ebola","zika","health emergency","epidemic","measles"],
  Nuclear: ["nuclear","nuclear test","radiation","radiation leak","supervolcano"],
  Weather: ["weather","solar flare","hurricane landfall"],
  ScienceResearch: ["scientific study","climate report","ipcc","astronomy discovery","nobel prize science"]
};

const ECONOMY_SUBCATEGORIES = {
  Inflation: ["inflation","cpi","core inflation","headline inflation","fed rate"],
  GDPGrowth: ["gdp","gdp growth","economic growth","china gdp","us gdp"],
  Housing: ["housing","mortgage","median home price","housing price"],
  Employment: ["unemployment rate","jobs","labor"],
  Banking: ["bank failure","central bank","federal reserve","bank of india","bank of canada"],
  Markets: ["s&p 500","nasdaq","dow jones","market cap","equity","etf"],
  Rates: ["interest rate","yield","treasuries","10-year treasury yield"],
  Corporate: ["corporate earnings","revenue","profit","dividend","buyback"],
  Recession: ["recession","deflation","stagflation","economic downturn","financial crisis"]
};

const CATEGORY_SUBCATEGORY_MAP = {
  Crypto: CRYPTO_MAP,
  Sports: SPORTS_SUBCATEGORIES,
  Politics: POLITICS_SUBCATEGORIES,
  Finance: FINANCE_SUBCATEGORIES,
  Technology: TECHNOLOGY_SUBCATEGORIES,
  WorldEvents: WORLD_EVENTS_SUBCATEGORIES,
  Geopolitics: GEOPOLITICS_SUBCATEGORIES,
  PopCulture: POPCULTURE_SUBCATEGORIES,
  ClimateAndScience: CLIMATE_SCIENCE_SUBCATEGORIES,
  Economy: ECONOMY_SUBCATEGORIES
};


async function initializeTelegramBot() {
  try {
    console.log("🚀 Initializing Telegram bot (POLLING MODE)...");

    bot = new TelegramBot(BOT_TOKEN, { polling: true });
    console.log("✅ Telegram bot initialized with polling");
    const botInfo = await bot.getMe();
    const BOT_USERNAME = botInfo.username;

    // Register bot commands so they appear in the "/" suggestion menu
    await bot.setMyCommands([
      { command: "start",    description: "Open Arken mini app" },
      { command: "wallet",   description: "View your wallet balance" },
      { command: "deposit",  description: "Deposit USDC or SOL" },
      { command: "withdraw", description: "Withdraw funds" },
      { command: "referral", description: "Get your referral link" },
      { command: "trending", description: "See trending markets" },
      { command: "bets",     description: "View active betting markets (groups)" },
    ]).catch(e => console.warn("setMyCommands failed:", e.message));

    // Helper: check that the user has a connected wallet before running a command.
    // Returns true if they do; sends an error message and returns false if they don't.
    async function requireWallet(telegramId, chatId) {
      const user = await User.findOne({ telegramId });
      if (!user) {
        bot.sendMessage(chatId,
          "❌ You haven't started the bot yet. Send /start to register.",
        );
        return false;
      }
      const walletDoc = await userPublicWalletModel.findOne({ telegramId });
      const hasWallet = walletDoc && walletDoc.wallets && walletDoc.wallets.length > 0;
      if (!hasWallet) {
        bot.sendMessage(chatId,
          "💼 *No Wallet Found*\n\nCreate your Arken wallet to get started. Both an Arbitrum and Solana wallet will be created instantly.",
          {
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [{ text: "🚀 Create Wallet", callback_data: "create_both_wallets" }],
              ],
            },
          },
        );
        return false;
      }
      return true;
    }

    bot.onText(/\/start(?:\s+(.+))?/, async (msg, match) => {
      const chatId = msg.chat.id;
      const param = match && match[1] ? match[1].trim() : null;

      let referrerId = null;

      // Handle referral deeplink: /start ref_<telegramId>
      if (param && param.startsWith("ref_")) {
        referrerId = parseInt(param.replace("ref_", ""), 10) || null;
      }

      // Handle private market invite deeplink: /start join_<marketId>
      if (param && param.startsWith("join_")) {
        const marketId = param.replace("join_", "");
        await storeTelegramUser(msg, null);
        try {
          await Market.findByIdAndUpdate(marketId, {
            $addToSet: { allowedTelegramIds: chatId },
          });
          bot.sendMessage(chatId, "✅ You've been added to the private market! Use /bets to find it.");
        } catch (e) {
          bot.sendMessage(chatId, "⚠️ Could not join market. The link may be invalid.");
        }
        return;
      }

      // Handle invite code deeplink: /start invite_<inviteCode>
      if (param && param.startsWith("invite_")) {
        const inviteCode = param.replace("invite_", "").toUpperCase();
        await storeTelegramUser(msg, null);
        try {
          const market = await Market.findOne({ inviteCode });
          if (!market) {
            bot.sendMessage(chatId, "⚠️ Invalid invite code. Please check the link and try again.");
            return;
          }
          await Market.findByIdAndUpdate(market._id, {
            $addToSet: { allowedTelegramIds: chatId },
          });
          bot.sendMessage(chatId, `✅ You've joined the private market: *${market.question}*\nOpen the app to start predicting!`, { parse_mode: "Markdown" });
        } catch (e) {
          bot.sendMessage(chatId, "⚠️ Could not join market. The link may be invalid.");
        }
        return;
      }

      await storeTelegramUser(msg, referrerId);

      // Notify referrer
      if (referrerId) {
        bot.sendMessage(
          referrerId,
          `🎉 A new user joined via your referral link! You'll earn 35% of the platform fee on all their trades.`
        ).catch(() => {});
      }

      const webAppUrl = `${process.env.MINI_APP_URL || "https://arken.blfdemo.online"}/?v=3&telegramId=${chatId}`;

      // Fetch live stats in parallel
      let activeMarkets = 0;
      let totalVolume = 0;
      let userBalance = 0;
      try {
        const [activeCount, volumeAgg, walletDoc] = await Promise.all([
          Market.countDocuments({ active: true }),
          Market.aggregate([{ $group: { _id: null, total: { $sum: "$totalVolume" } } }]),
          userPublicWalletModel.findOne({ telegramId: chatId }),
        ]);
        activeMarkets = activeCount || 0;
        totalVolume = (volumeAgg && volumeAgg[0] ? volumeAgg[0].total : 0).toFixed(2);
        if (walletDoc) {
          userBalance = Number(walletDoc.balance || 0).toFixed(2);
        }
      } catch (e) {
        console.error("Stats fetch error:", e.message);
      }

      bot.sendPhoto(
        chatId,
        "https://res.cloudinary.com/dqtdd1frp/image/upload/v1765269718/_group__nwyhgf.webp",
        {
          caption: `🚀 *Welcome to Arken Prediction Markets*
The ultimate prediction layer for the Solana ecosystem.

📊 Live Markets: *${activeMarkets}* Active
💰 Total Volume: *$${totalVolume}*
💼 Your Balance: *$${userBalance}*

What would you like to do?`,
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{ text: "🚀 Open Trading App", web_app: { url: webAppUrl } }],
              [
                { text: "📊 Active Markets", callback_data: "start_markets" },
                { text: "📥 Deposit", callback_data: "start_deposit" },
              ],
              [
                { text: "💼 Portfolio", callback_data: "start_portfolio" },
                { text: "⚙️ Settings", callback_data: "start_settings" },
              ],
            ],
          },
        }
      );
    });

    bot.on("my_chat_member", async (msg) => {
      try {
        const chat = msg.chat;
        const newStatus = msg.new_chat_member.status;

        if (chat.type !== "private") {
          const groupId = chat.id;

          if (newStatus === "administrator") {
            const exists = await TelegramGroup.findOne({ groupId });
            if (!exists) {
              await TelegramGroup.create({
                groupId,
                groupTitle: chat.title,
                groupOwnerId: msg.from.id,
                commissionPercent: 5,
                bettingEnabled: false,
                botIsAdmin: true,
              });
            } else {
              await TelegramGroup.updateOne({ groupId }, { $set: { botIsAdmin: true } });
            }

            bot.sendMessage(
              groupId,
              "✅ *Arken Bot Activated!*\n\n" +
              "I'm now set up in this group. Here's how to get started:\n\n" +
              "1️⃣ The group owner sends /enablebets to activate prediction markets\n" +
              "2️⃣ Members can then use /trending and /bets to view markets\n\n" +
              "💡 Personal commands (/wallet, /deposit, /withdraw) work via DM.",
              { parse_mode: "Markdown" }
            );
          } else if (newStatus === "member") {
            // Bot was added as regular member (not admin)
            bot.sendMessage(
              groupId,
              "👋 *Arken Bot joined!*\n\nTo use prediction markets in this group, please make me an *admin* first, then the owner can run /enablebets.",
              { parse_mode: "Markdown" }
            ).catch(() => {});
          }
        }
      } catch (err) {
        console.error("Group store error:", err.message);
      }
    });

    bot.onText(/\/enablebets/, async (msg) => {
      const groupId = msg.chat.id;
      const userId = msg.from.id;

      if (msg.chat.type === "private") {
        return bot.sendMessage(groupId, "ℹ️ /enablebets is for group chats. Add me as admin to a group and use this command there.");
      }

      const group = await TelegramGroup.findOne({ groupId });
      if (!group) {
        return bot.sendMessage(groupId, "⚠️ Bot is not set up as admin in this group yet. Please make me an admin first, then try again.");
      }

      if (group.groupOwnerId !== userId) {
        return bot.sendMessage(groupId, "❌ Only the group owner can enable betting.");
      }

      if (group.bettingEnabled) {
        return bot.sendMessage(groupId, "✅ Betting is already enabled in this group!");
      }

      group.bettingEnabled = true;
      await group.save();
      bot.sendMessage(groupId, "🎯 Betting is now enabled! Users can use /trending and /bets to find markets.");
    });

    bot.onText(/\/bets/, async (msg) => {
      const groupId = msg.chat.id;
      const group = await TelegramGroup.findOne({ groupId });

      if (!group || !group.bettingEnabled) {
        return bot.sendMessage(groupId, "❌ Betting is not enabled in this group");
      }

      bot.sendMessage(groupId, "📊 *Select Bet Category*", {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              { text: "📋 All", callback_data: "bets_all" },
              { text: "🪙 Crypto", callback_data: "bets_crypto" },
              { text: "📦 Others", callback_data: "bets_others" }
            ]
          ]
        }
      });
    });

    // ── /deposit command ───────────────────────────────────────────────────
    bot.onText(/\/deposit/, async (msg) => {
      const chatId = msg.chat.id;
      const telegramId = msg.from.id;
      const depositUrl = `${process.env.MINI_APP_URL || "https://arken.blfdemo.online"}/deposit?v=3&telegramId=${telegramId}`;
      const walletDoc = await userPublicWalletModel.findOne({ telegramId });
      if (!walletDoc || !walletDoc.wallets || !walletDoc.wallets.length) {
        return bot.sendMessage(chatId, "💼 *No Wallet Yet*\n\nCreate a custodial wallet to get your deposit address.\nYour balance will be credited automatically once funds arrive.", {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{ text: "🚀 Create Wallet", callback_data: "create_both_wallets" }],
              [{ text: "📥 Open Deposit App", web_app: { url: depositUrl } }],
            ],
          },
        });
      }
      let text = "📥 *Your Deposit Addresses*\n\nSend funds to your address below:\n\n";
      for (const w of walletDoc.wallets) {
        text += `*${w.network}*\n\`${w.address}\`\n\n`;
      }
      text += "⚠️ Only send the correct token to each address.";
      bot.sendMessage(chatId, text, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "📥 Open Deposit App", web_app: { url: depositUrl } }]],
        },
      });
    });

    // ── /withdraw command ──────────────────────────────────────────────────
    bot.onText(/\/withdraw/, async (msg) => {
      const chatId = msg.chat.id;
      const telegramId = msg.from.id;
      const webAppUrl = `${process.env.MINI_APP_URL || "https://arken.blfdemo.online"}/deposit?tab=withdraw&v=3&telegramId=${telegramId}`;
      bot.sendMessage(chatId,
        "💸 *Withdraw Funds*\n\nWithdraw your USDC or SOL balance to any wallet address.",
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [[{ text: "💸 Open Withdraw", web_app: { url: webAppUrl } }]],
          },
        }
      );
    });

    // ── /clear_cache command ───────────────────────────────────────────────
    bot.onText(/\/clear_cache/, async (msg) => {
      const chatId = msg.chat.id;
      const telegramId = msg.from.id;
      const ts = Date.now();
      const webAppUrl = `${process.env.MINI_APP_URL || "https://arken.blfdemo.online"}/?clear=1&t=${ts}&telegramId=${telegramId}`;
      bot.sendMessage(chatId,
        "🧹 *Clear App Cache*\n\nThis will reset your local session (wallet selection, chain preference, etc.).\n\nTap the button below to reopen with a clean slate.",
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [[{ text: "🧹 Reopen Fresh", web_app: { url: webAppUrl } }]],
          },
        }
      );
    });

    // ── /referral command ──────────────────────────────────────────────────
    bot.onText(/\/referral/, async (msg) => {
      const chatId = msg.chat.id;
      const telegramId = msg.from.id;
      const referralLink = BOT_USERNAME
        ? `https://t.me/${BOT_USERNAME}?start=ref_${telegramId}`
        : null;
      if (referralLink) {
        bot.sendMessage(chatId,
          `🎁 *Your Referral Link*\n\nShare this link to earn a cut of every bet your referrals place:\n\n${referralLink}`,
          { parse_mode: "Markdown" }
        );
      } else {
        bot.sendMessage(chatId, "❌ Referral link unavailable. Please try again later.");
      }
    });

//     bot.on("callback_query", async (query) => {
//       try {
//         const groupId = query.message.chat.id;
//         const telegramId = query.from.id;
//         const data = query.data;

//         // Handle search subcategory clicks
//         if (data.startsWith("search_sub_")) {
//           const parts = data.replace("search_sub_", "").split("_");
//           const category = parts[0];
//           const subcategoryName = parts.slice(1).join("_");

//           // Get keywords for this subcategory
//           const subcategoryMap = CATEGORY_SUBCATEGORY_MAP[category];
//           const keywords = subcategoryMap[subcategoryName] || [];

//           if (!keywords.length) {
//             bot.answerCallbackQuery(query.id);
//             return bot.sendMessage(groupId, `📭 No keywords found for ${subcategoryName}`);
//           }

//           // Build regex from all keywords
//           const regexPattern = keywords.join("|");
//           const regex = new RegExp(regexPattern, "i");

//           const manual = await Market.find({
//             active: true,
//             category: category,
//             endDate: { $gte: new Date() },
//             $or: [
//               { question: regex },
//               { description: regex },
//               { subcategory: regex }
//             ]
//           }).limit(20).lean();

//           const poly = await PolyMarket.find({
//             active: true,
//             closed: false,
//             category: category,
//             endDate: { $gte: new Date() },
//             $or: [
//               { question: regex },
//               { subcategory: regex }
//             ]
//           }).limit(20).lean();

//           const results = [...manual, ...poly];

//           if (!results.length) {
//             bot.answerCallbackQuery(query.id);
//             return bot.sendMessage(groupId, `📭 No bets found in ${subcategoryName}`);
//           }

//           // Same design as search - inline keyboard with 2 buttons per row
//           const inlineKeyboard = [];

//           for (let i = 0; i < results.length; i += 2) {
//             const row = [];

//             for (let j = i; j < i + 2 && j < results.length; j++) {
//               const bet = results[j];
//               const token = generateJwt(telegramId, groupId, bet._id);

//               const payload = Buffer.from(
//   JSON.stringify({ marketId: bet._id, token })
// ).toString("base64");

// const url = `https://t.me/Arkenpredictionbot?startapp=${payload}`;
//               // const url = `https://arken.blfdemo.online/market-details/${bet._id}?token=${token}`;

//               const icon = getCategoryIcon(bet.category);

//               row.push({
//                 text: `${icon} ${
//                   bet.question.length > 24
//                     ? bet.question.slice(0, 24) + "…"
//                     : bet.question
//                 }`,
//                 url
//               });
//             }

//             inlineKeyboard.push(row);
//           }

//           await bot.sendMessage(
//             groupId,
//             `🟢 *${subcategoryName} Markets*\nTap a market to open 👇`,
//             {
//               parse_mode: "Markdown",
//               reply_markup: {
//                 inline_keyboard: inlineKeyboard
//               }
//             }
//           );

//           bot.answerCallbackQuery(query.id);
//           return;
//         }

//         // Original /bets callback handling
//         let filter = {};
//         if (query.data === "bets_crypto") filter.category = "Crypto";
//         if (query.data === "bets_others") filter.category = "Other";

//         const manual = await Market.find({
//           active: true,
//           endDate: { $gte: new Date() },
//           ...filter
//         }).limit(20).lean();

//         const poly = await PolyMarket.find({
//           active: true,
//           closed: false,
//           endDate: { $gte: new Date() },
//           ...filter
//         }).limit(20).lean();

//         const merged = [...manual, ...poly];
//         if (!merged.length) {
//           bot.answerCallbackQuery(query.id);
//           return bot.sendMessage(groupId, "📭 No bets found");
//         }

//         for (const bet of merged) {
//           const token = generateJwt(telegramId, groupId, bet._id);
//           const payload = Buffer.from(
//   JSON.stringify({ marketId: bet._id, token })
// ).toString("base64");

// const url = `https://t.me/Arkenpredictionbot?startapp=${payload}`;
//           // const url = `https://arken.blfdemo.online/market-details/${bet._id}?token=${token}`;

//           await bot.sendMessage(groupId, `📊 *${bet.question}*`, {
//             parse_mode: "Markdown",
//             reply_markup: {
//               inline_keyboard: [[{ text: "👉 Place Bet", url }]]
//             }
//           });
//         }

//         bot.answerCallbackQuery(query.id);
//       } catch (err) {
//         console.error("Callback error:", err);
//       }
//     });

bot.on("callback_query", async (query) => {
  try {
    const groupId = query.message.chat.id;
    const telegramId = query.from.id;
    const data = query.data;

    // ── Group /bets category callbacks ────────────────────────────────────
    if (data === "bets_all" || data === "bets_crypto" || data === "bets_others") {
      bot.answerCallbackQuery(query.id);

      let filter = {};
      if (data === "bets_crypto") filter.category = "Crypto";
      if (data === "bets_others") filter.category = { $nin: ["Crypto"] };

      const markets = await Market.find({
        status: { $in: ["active", "pending"] },
        endDate: { $gte: new Date() },
        ...(data !== "bets_all" ? filter : {}),
      }).limit(10).lean();

      if (!markets.length) {
        return bot.editMessageText("📭 No markets found in this category.", {
          chat_id: groupId,
          message_id: query.message.message_id,
        }).catch(() => bot.sendMessage(groupId, "📭 No markets found in this category."));
      }

      const webAppBase = process.env.MINI_APP_URL || "https://arken.blfdemo.online";
      const rows = [];
      for (let i = 0; i < markets.length; i += 2) {
        const row = [];
        for (let j = i; j < i + 2 && j < markets.length; j++) {
          const m = markets[j];
          const url = `${webAppBase}/market-details/${m._id}?v=3&telegramId=${telegramId}`;
          row.push({
            text: m.question.length > 30 ? m.question.slice(0, 30) + "…" : m.question,
            web_app: { url },
          });
        }
        rows.push(row);
      }

      return bot.editMessageText("📊 *Active Markets* — tap to open:", {
        chat_id: groupId,
        message_id: query.message.message_id,
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: rows },
      }).catch(() => bot.sendMessage(groupId, "📊 *Active Markets* — tap to open:", {
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: rows },
      }));
    }

    if (data.startsWith("trending_page_")) {

      const PAGE_SIZE = 6;
      const page = parseInt(data.split("_")[2]);
      const skip = (page - 1) * PAGE_SIZE;

      const totalCount = await PolyMarket.countDocuments({
        active: true,
        closed: false,
        endDate: { $gte: new Date() },
      });

      const trendingMarkets = await PolyMarket.find({
        active: true,
        closed: false,
        endDate: { $gte: new Date() },
      })
        .sort({ liquidity: -1, volume24hr: -1 })
        .skip(skip)
        .limit(PAGE_SIZE)
        .lean();

      const inlineKeyboard = [];

      for (let i = 0; i < trendingMarkets.length; i += 2) {
        const row = [];

        for (let j = i; j < i + 2 && j < trendingMarkets.length; j++) {

          const bet = trendingMarkets[j];
          const icon = getCategoryIcon(bet.category);
          const marketUrl = `${process.env.MINI_APP_URL || "https://arken.blfdemo.online"}/market-details/${bet._id}?v=3&telegramId=${telegramId}`;

          row.push({
            text: `${icon} ${
              bet.question.length > 24
                ? bet.question.slice(0, 24) + "…"
                : bet.question
            }`,
            web_app: { url: marketUrl },
          });

        }

        inlineKeyboard.push(row);
      }

      const totalPages = Math.ceil(totalCount / PAGE_SIZE);

      const navRow = [];

      if (page > 1)
        navRow.push({
          text: "⬅️ Previous",
          callback_data: `trending_page_${page - 1}`,
        });

      if (page < totalPages)
        navRow.push({
          text: "Next ➡️",
          callback_data: `trending_page_${page + 1}`,
        });

      if (navRow.length) inlineKeyboard.push(navRow);

      await bot.editMessageText(
        `🔥 *Trending Markets*\nPage ${page} of ${totalPages}\nTap a market to open 👇`,
        {
          chat_id: groupId,
          message_id: query.message.message_id,
          parse_mode: "Markdown",
          reply_markup: { inline_keyboard: inlineKeyboard },
        }
      );

      bot.answerCallbackQuery(query.id);
      return;
    }

if (data.startsWith("search_page_")) {

  const SEARCH_PAGE_SIZE = 6;


  const raw = data.replace("search_page_", "");
  const lastUnderscore = raw.lastIndexOf("_");

  const keywordEncoded = raw.substring(0, lastUnderscore);
  const page = parseInt(raw.substring(lastUnderscore + 1));

  const keywordCombined = decodeURIComponent(keywordEncoded);

  const skip = (page - 1) * SEARCH_PAGE_SIZE;


  const categoryNames = Object.keys(CATEGORY_SUBCATEGORY_MAP);

  let categoryFilter = null;
  let keywordFilter = null;

  const splitWords = keywordCombined.split(" ");

  for (const word of splitWords) {

    const found = categoryNames.find(
      c => c.toLowerCase() === word.toLowerCase()
    );

    if (found)
      categoryFilter = found;
    else if (!keywordFilter)
      keywordFilter = word;
  }


  const regex = keywordFilter
    ? new RegExp(keywordFilter, "i")
    : new RegExp(keywordCombined, "i");


  const manualQuery = {
    active: true,
    endDate: { $gte: new Date() }
  };

  const polyQuery = {
    active: true,
    closed: false,
    endDate: { $gte: new Date() }
  };


  if (categoryFilter) {
    manualQuery.category = categoryFilter;
    polyQuery.category = categoryFilter;
  }


  if (regex) {

    manualQuery.$or = [
      { question: regex },
      { description: regex },
      { subcategory: regex }
    ];

    polyQuery.$or = [
      { question: regex },
      { subcategory: regex }
    ];
  }



  const manualAll = await Market.find(manualQuery).lean();
  const polyAll = await PolyMarket.find(polyQuery).lean();

  const mergedAll = [...manualAll, ...polyAll];

  const totalCount = mergedAll.length;
  const totalPages = Math.ceil(totalCount / SEARCH_PAGE_SIZE);

  const results = mergedAll.slice(skip, skip + SEARCH_PAGE_SIZE);


  if (!results.length) {
    bot.answerCallbackQuery(query.id);
    return bot.sendMessage(groupId, "📭 No results found");
  }


  const inlineKeyboard = [];

  for (let i = 0; i < results.length; i += 2) {

    const row = [];

    for (let j = i; j < i + 2 && j < results.length; j++) {

      const bet = results[j];

      const token = generateJwt(telegramId, groupId, bet._id);

      const payload = Buffer.from(
        JSON.stringify({ marketId: bet._id, token })
      ).toString("base64");

      const url = `https://t.me/${BOT_USERNAME}?startapp=${payload}`;

      const icon = getCategoryIcon(bet.category);

      row.push({
        text: `${icon} ${
          bet.question.length > 24
            ? bet.question.slice(0, 24) + "…"
            : bet.question
        }`,
        url
      });
    }

    inlineKeyboard.push(row);
  }


  const navRow = [];

  if (page > 1)
    navRow.push({
      text: "⬅️ Previous",
      callback_data: `search_page_${encodeURIComponent(keywordCombined)}_${page - 1}`
    });


  if (page < totalPages)
    navRow.push({
      text: "Next ➡️",
      callback_data: `search_page_${encodeURIComponent(keywordCombined)}_${page + 1}`
    });


  if (navRow.length)
    inlineKeyboard.push(navRow);


  await bot.editMessageText(
    `🟢 *Search Results*\nPage ${page} of ${totalPages}\nTap a market to open 👇`,
    {
      chat_id: groupId,
      message_id: query.message.message_id,
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: inlineKeyboard }
    }
  );


  bot.answerCallbackQuery(query.id);

  return;
}





    
    if (data.startsWith("search_sub_")) {

      const PAGE_SIZE = 6;

      const clean = data.replace("search_sub_", "");
      const parts = clean.split("_page_");

      const page = parts[1] ? parseInt(parts[1]) : 1;
      const skip = (page - 1) * PAGE_SIZE;

      const mainParts = parts[0].split("_");

      const category = mainParts[0];
      const subcategoryName = mainParts.slice(1).join("_");

      const subcategoryMap = CATEGORY_SUBCATEGORY_MAP[category];
      const keywords = subcategoryMap[subcategoryName] || [];

      if (!keywords.length) {
        bot.answerCallbackQuery(query.id);
        return bot.sendMessage(groupId, `📭 No keywords found for ${subcategoryName}`);
      }

      const regexPattern = keywords.join("|");
      const regex = new RegExp(regexPattern, "i");

      const manualCount = await Market.countDocuments({
        active: true,
        category,
        endDate: { $gte: new Date() },
        $or: [
          { question: regex },
          { description: regex },
          { subcategory: regex }
        ]
      });

      const polyCount = await PolyMarket.countDocuments({
        active: true,
        closed: false,
        category,
        endDate: { $gte: new Date() },
        $or: [
          { question: regex },
          { subcategory: regex }
        ]
      });

      const totalCount = manualCount + polyCount;
      const totalPages = Math.ceil(totalCount / PAGE_SIZE);

      const manual = await Market.find({
        active: true,
        category,
        endDate: { $gte: new Date() },
        $or: [
          { question: regex },
          { description: regex },
          { subcategory: regex }
        ]
      }).skip(skip).limit(PAGE_SIZE).lean();

      const poly = await PolyMarket.find({
        active: true,
        closed: false,
        category,
        endDate: { $gte: new Date() },
        $or: [
          { question: regex },
          { subcategory: regex }
        ]
      }).skip(skip).limit(PAGE_SIZE).lean();

      const results = [...manual, ...poly].slice(0, PAGE_SIZE);

      if (!results.length) {
        bot.answerCallbackQuery(query.id);
        return bot.sendMessage(groupId, `📭 No bets found`);
      }

      const inlineKeyboard = [];

      for (let i = 0; i < results.length; i += 2) {

        const row = [];

        for (let j = i; j < i + 2 && j < results.length; j++) {

          const bet = results[j];

          const token = generateJwt(telegramId, groupId, bet._id);

          const payload = Buffer.from(
            JSON.stringify({ marketId: bet._id, token })
          ).toString("base64");

          const url = `https://t.me/${BOT_USERNAME}?startapp=${payload}`;

          const icon = getCategoryIcon(bet.category);

          row.push({
            text: `${icon} ${
              bet.question.length > 24
                ? bet.question.slice(0, 24) + "…"
                : bet.question
            }`,
            url
          });

        }

        inlineKeyboard.push(row);
      }


      const navRow = [];

      if (page > 1)
        navRow.push({
          text: "⬅️ Previous",
          callback_data: `search_sub_${category}_${subcategoryName}_page_${page - 1}`
        });

      if (page < totalPages)
        navRow.push({
          text: "Next ➡️",
          callback_data: `search_sub_${category}_${subcategoryName}_page_${page + 1}`
        });

      if (navRow.length) inlineKeyboard.push(navRow);

      await bot.editMessageText(
        `🟢 *${subcategoryName} Markets*\nPage ${page} of ${totalPages}`,
        {
          chat_id: groupId,
          message_id: query.message.message_id,
          parse_mode: "Markdown",
          reply_markup: { inline_keyboard: inlineKeyboard }
        }
      );

      bot.answerCallbackQuery(query.id);
      return;
    }



    if (
      data.startsWith("bets_all") ||
      data.startsWith("bets_crypto") ||
      data.startsWith("bets_others")
    ) {

      const PAGE_SIZE = 6;

      const parts = data.split("_page_");

      const categoryKey = parts[0]; 

      const page = parts[1] ? parseInt(parts[1]) : 1;

      const skip = (page - 1) * PAGE_SIZE;

      let filter = {};

      if (categoryKey === "bets_crypto") filter.category = "Crypto";
      if (categoryKey === "bets_others") filter.category = "Other";


      const manualCount = await Market.countDocuments({
        active: true,
        endDate: { $gte: new Date() },
        ...filter
      });

      const polyCount = await PolyMarket.countDocuments({
        active: true,
        closed: false,
        endDate: { $gte: new Date() },
        ...filter
      });

      const totalCount = manualCount + polyCount;

      const totalPages = Math.ceil(totalCount / PAGE_SIZE);


      const manual = await Market.find({
        active: true,
        endDate: { $gte: new Date() },
        ...filter
      }).skip(skip).limit(PAGE_SIZE).lean();


      const poly = await PolyMarket.find({
        active: true,
        closed: false,
        endDate: { $gte: new Date() },
        ...filter
      }).skip(skip).limit(PAGE_SIZE).lean();


      const merged = [...manual, ...poly].slice(0, PAGE_SIZE);


      if (!merged.length) {
        bot.answerCallbackQuery(query.id);
        return bot.sendMessage(groupId, "📭 No bets found");
      }


      const inlineKeyboard = [];

      for (let i = 0; i < merged.length; i += 2) {

        const row = [];

        for (let j = i; j < i + 2 && j < merged.length; j++) {

          const bet = merged[j];

          const token = generateJwt(telegramId, groupId, bet._id);

          const payload = Buffer.from(
            JSON.stringify({ marketId: bet._id, token })
          ).toString("base64");

          const url = `https://t.me/${BOT_USERNAME}?startapp=${payload}`;

          row.push({
            text: `📊 ${
              bet.question.length > 24
                ? bet.question.slice(0, 24) + "…"
                : bet.question
            }`,
            url
          });

        }

        inlineKeyboard.push(row);
      }


      const navRow = [];

      if (page > 1)
        navRow.push({
          text: "⬅️ Previous",
          callback_data: `${categoryKey}_page_${page - 1}`
        });

      if (page < totalPages)
        navRow.push({
          text: "Next ➡️",
          callback_data: `${categoryKey}_page_${page + 1}`
        });


      if (navRow.length)
        inlineKeyboard.push(navRow);


      await bot.editMessageText(
        `📊 *Bet Markets*\nPage ${page} of ${totalPages}`,
        {
          chat_id: groupId,
          message_id: query.message.message_id,
          parse_mode: "Markdown",
          reply_markup: { inline_keyboard: inlineKeyboard }
        }
      );


      bot.answerCallbackQuery(query.id);
      return;
    }

    // --- Wallet dashboard callbacks ---
    // ── Export Private Key ────────────────────────────────────────────────────
    if (data === "export_key") {
      bot.answerCallbackQuery(query.id);
      const chatId = query.message.chat.id;
      const msgId = query.message.message_id;

      // Daily limit: 1 export per 24 hours
      const user = await User.findOne({ telegramId });
      const lastExport = user?.lastKeyExportAt;
      if (lastExport && (Date.now() - new Date(lastExport).getTime()) < 24 * 60 * 60 * 1000) {
        return bot.editMessageText(
          "⚠️ *Daily limit reached.*\n\nYou can export your private key once every 24 hours.",
          { chat_id: chatId, message_id: msgId, parse_mode: "Markdown",
            reply_markup: { inline_keyboard: [[{ text: "← Back", callback_data: "back_to_wallet" }]] } }
        );
      }

      return bot.editMessageText(
        "🔑 *Export Private Key*\n\n⚠️ Your private key gives *full access* to your wallet.\nNever share it with anyone — Arken will never ask for it.\n\nSelect which chain key to export:",
        {
          chat_id: chatId, message_id: msgId, parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [
                { text: "🔷 Arbitrum Key", callback_data: "export_key_arb" },
                { text: "💎 Solana Key", callback_data: "export_key_sol" },
              ],
              [{ text: "← Back", callback_data: "back_to_wallet" }],
            ],
          },
        }
      );
    }

    if (data === "export_key_arb" || data === "export_key_sol") {
      bot.answerCallbackQuery(query.id);
      const chatId = query.message.chat.id;
      const network = data === "export_key_arb" ? "ARB" : "SOL";

      const walletDoc = await userPublicWalletModel.findOne({ telegramId });
      const wallet = walletDoc?.wallets?.find(w => w.network === network || (network === "ARB" && w.network === "EVM"));

      if (!wallet?.privateKey) {
        return bot.sendMessage(chatId,
          `❌ No ${network} wallet found on your account.`,
          { reply_markup: { inline_keyboard: [[{ text: "← Back", callback_data: "back_to_wallet" }]] } }
        );
      }

      try {
        const decryptedKey = await common.decrypt(wallet.privateKey);

        // Audit log
        await User.findOneAndUpdate({ telegramId }, { lastKeyExportAt: new Date() });
        console.log(`[KEY_EXPORT] telegramId=${telegramId} network=${network} at=${new Date().toISOString()}`);

        const keyMsg = await bot.sendMessage(chatId,
          `🔑 *Your ${network} Private Key:*\n\n\`${decryptedKey}\`\n\n⚠️ *This message will self-destruct in 30 seconds.*\nNever share this with anyone. Arken will never ask for your key.`,
          { parse_mode: "Markdown" }
        );

        // Auto-delete after 30 seconds
        setTimeout(() => {
          bot.deleteMessage(chatId, keyMsg.message_id).catch(() => {});
        }, 30000);

      } catch (err) {
        console.error("[KEY_EXPORT] decrypt error:", err.message);
        bot.sendMessage(chatId, "❌ Could not retrieve your key. Please try again later.");
      }
      return;
    }

    if (data === "wallet_deposit") {
      bot.answerCallbackQuery(query.id);
      const chatId = query.message.chat.id;
      const msgId = query.message.message_id;
      const walletDoc = await userPublicWalletModel.findOne({ telegramId });
      if (!walletDoc || !walletDoc.wallets.length) {
        return bot.editMessageText(
          "💼 *No Wallet Found*\n\nCreate a wallet first to get your deposit address.",
          {
            chat_id: chatId,
            message_id: msgId,
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "🚀 Create Wallet", callback_data: "create_both_wallets" },
                ],
                [{ text: "← Back", callback_data: "back_to_wallet" }],
              ],
            },
          }
        );
      }
      let text = "📥 *Your Deposit Addresses*\n\nSend funds to your address below. Your balance will be credited automatically.\n\n";
      for (const w of walletDoc.wallets) {
        text += `*${w.network}*\n\`${w.address}\`\n\n`;
      }
      text += "⚠️ Only send the correct token to each address.";
      return bot.editMessageText(text, {
        chat_id: chatId,
        message_id: msgId,
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: [[{ text: "← Back", callback_data: "back_to_wallet" }]] },
      });
    }

    if (data === "wallet_withdraw") {
      bot.answerCallbackQuery(query.id);
      const chatId = query.message.chat.id;
      const msgId = query.message.message_id;
      return bot.editMessageText(
        "📤 *Withdraw*\n\nTo withdraw, use the app:\n\n" +
        `🔗 [Open App](${process.env.MINI_APP_URL || "https://arken.blfdemo.online"}/?v=3&telegramId=${telegramId})`,
        {
          chat_id: chatId,
          message_id: msgId,
          parse_mode: "Markdown",
          reply_markup: { inline_keyboard: [[{ text: "← Back", callback_data: "back_to_wallet" }]] },
        }
      );
    }

    if (data === "wallet_referrals") {
      bot.answerCallbackQuery(query.id);
      const Referral = require("./models/referral");
      const chatId = query.message.chat.id;
      const msgId = query.message.message_id;
      const referrals = await Referral.find({ referrerId: telegramId });
      const totalEarned = referrals.reduce((sum, r) => sum + r.totalEarned, 0);
      const me = await bot.getMe();
      const referralLink = `https://t.me/${me.username}?start=ref_${telegramId}`;
      return bot.editMessageText(
        `👥 *Referral Dashboard*\n\nReferred users: *${referrals.length}*\nTotal earned: *${totalEarned.toFixed(4)}*\n\n🔗 Your link:\n\`${referralLink}\``,
        {
          chat_id: chatId,
          message_id: msgId,
          parse_mode: "Markdown",
          reply_markup: { inline_keyboard: [[{ text: "← Back", callback_data: "back_to_wallet" }]] },
        }
      );
    }

    if (data === "wallet_history") {
      bot.answerCallbackQuery(query.id);
      const chatId = query.message.chat.id;
      const msgId = query.message.message_id;
      const Prediction = require("./models/predictions");
      const bets = await Prediction.find({ telegramId }).sort({ createdAt: -1 }).limit(10).lean();
      const backRow = [{ text: "← Back", callback_data: "back_to_wallet" }];
      if (!bets.length) {
        return bot.editMessageText("📋 No bets placed yet.", {
          chat_id: chatId,
          message_id: msgId,
          reply_markup: { inline_keyboard: [backRow] },
        });
      }
      let text = "📋 *Last 10 Bets*\n\n";
      for (const b of bets) {
        const emoji = b.status === "WON" ? "✅" : b.status === "LOST" ? "❌" : "⏳";
        text += `${emoji} *${b.outcomeLabel}* — ${b.amount} ${b.currency || ""} | ${b.status}\n`;
      }
      return bot.editMessageText(text, {
        chat_id: chatId,
        message_id: msgId,
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: [backRow] },
      });
    }

    if (data === "wallet_mymarkets") {
      bot.answerCallbackQuery(query.id);
      const chatId = query.message.chat.id;
      const msgId = query.message.message_id;
      const userMarkets = await Market.find({ creatorTelegramId: String(telegramId) })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();
      const backRow = [{ text: "← Back", callback_data: "back_to_wallet" }];
      if (!userMarkets.length) {
        return bot.editMessageText("📊 You haven't created any markets yet.", {
          chat_id: chatId,
          message_id: msgId,
          reply_markup: { inline_keyboard: [backRow] },
        });
      }
      let text = "📊 *My Markets*\n\n";
      for (const m of userMarkets) {
        const statusEmoji = m.marketStatus === "active" ? "🟢" : m.marketStatus === "resolved" ? "✅" : "⏳";
        const end = m.endDate ? new Date(m.endDate).toLocaleDateString() : "—";
        text += `${statusEmoji} *${m.question}*\nStatus: ${m.marketStatus || "pending"} | Ends: ${end}\n\n`;
      }
      return bot.editMessageText(text, {
        chat_id: chatId,
        message_id: msgId,
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: [backRow] },
      });
    }

    // --- /start button callbacks ---
    if (data === "start_markets") {
      bot.answerCallbackQuery(query.id);
      const chatId = query.message.chat.id;
      const msgId = query.message.message_id;
      const topMarkets = await Market.find({ active: true, endDate: { $gte: new Date() } })
        .sort({ totalVolume: -1 })
        .limit(3)
        .lean();
      const webAppUrl = `${process.env.MINI_APP_URL || "https://arken.blfdemo.online"}/?v=3&telegramId=${telegramId}`;
      let text = topMarkets.length
        ? "📊 *Top Active Markets*\n\n" + topMarkets.map((m, i) =>
            `${i + 1}. *${m.question}*\n   Volume: $${(m.totalVolume || 0).toFixed(2)}`
          ).join("\n\n")
        : "📭 No active markets right now. Check back soon!";
      return editMsgAny(chatId, msgId, text, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "🚀 Open Trading App", web_app: { url: webAppUrl } }],
            [{ text: "← Back", callback_data: "back_to_start" }],
          ],
        },
      });
    }

    if (data === "start_deposit") {
      bot.answerCallbackQuery(query.id);
      const chatId = query.message.chat.id;
      const msgId = query.message.message_id;
      const walletDoc = await userPublicWalletModel.findOne({ telegramId });
      if (!walletDoc || !walletDoc.wallets || !walletDoc.wallets.length) {
        return editMsgAny(chatId, msgId,
          "💼 *No Wallet Yet*\n\nCreate a custodial wallet to get your deposit address.",
          {
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "🚀 Create Wallet", callback_data: "create_both_wallets" },
                ],
                [{ text: "← Back", callback_data: "back_to_start" }],
              ],
            },
          }
        );
      }
      let text = "📥 *Your Deposit Addresses*\n\nSend funds to your address below. Your balance will be credited automatically.\n\n";
      for (const w of walletDoc.wallets) {
        text += `*${w.network}*\n\`${w.address}\`\n\n`;
      }
      text += "⚠️ Only send the correct token to each address.";
      return editMsgAny(chatId, msgId, text, {
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: [[{ text: "← Back", callback_data: "back_to_start" }]] },
      });
    }

    if (data === "start_portfolio") {
      bot.answerCallbackQuery(query.id);
      const chatId = query.message.chat.id;
      const msgId = query.message.message_id;
      const Prediction = require("./models/predictions");
      const activeBets = await Prediction.find({ telegramId, status: "OPEN" })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();
      const backRow = [{ text: "← Back", callback_data: "back_to_start" }];
      if (!activeBets.length) {
        return editMsgAny(chatId, msgId, "💼 You have no active bets. Open the app to start predicting!", {
          reply_markup: { inline_keyboard: [backRow] },
        });
      }
      let text = "💼 *Your Active Bets*\n\n";
      for (const b of activeBets) {
        text += `⏳ *${b.outcomeLabel || "Unknown"}*\n   ${b.amount} ${b.currency || ""} · potential: ${(b.potentialPayout || 0).toFixed(4)}\n\n`;
      }
      return editMsgAny(chatId, msgId, text, {
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: [backRow] },
      });
    }

    if (data === "start_settings") {
      bot.answerCallbackQuery(query.id);
      const chatId = query.message.chat.id;
      const msgId = query.message.message_id;
      return editMsgAny(chatId, msgId,
        `⚙️ *Settings*\n\nManage your Arken account settings in the app.\n\n• Wallet connections\n• Notification preferences\n• Referral program\n\nUse /wallet to view balances or open the app for full settings.`,
        {
          parse_mode: "Markdown",
          reply_markup: { inline_keyboard: [[{ text: "← Back", callback_data: "back_to_start" }]] },
        }
      );
    }

    // --- Wallet creation callback — creates both ARB and SOL wallets at once ---
    if (data === "create_both_wallets" || data === "create_sol_wallet" || data === "create_arb_wallet") {
      bot.answerCallbackQuery(query.id);
      const chatId = query.message.chat.id;
      const msgId = query.message.message_id;
      try {
        const [arbResult, solResult] = await Promise.all([
          creat_new_wallet({ telegramId: String(telegramId), network: "ARB" }),
          creat_new_wallet({ telegramId: String(telegramId), network: "SOL" }),
        ]);
        if (!arbResult.status && !solResult.status) {
          return editMsgAny(chatId, msgId, `❌ ${arbResult.message || "Could not create wallets."}`, {
            reply_markup: { inline_keyboard: [[{ text: "← Back", callback_data: "back_to_start" }]] },
          });
        }
        const arbAddress = arbResult.data?.address || "N/A";
        const solAddress = solResult.data?.address || "N/A";
        return editMsgAny(chatId, msgId,
          `✅ *Wallets Created*\n\n` +
          `🔷 *Arbitrum (USDC/ETH)*\n\`${arbAddress}\`\n\n` +
          `💎 *Solana (USDC/SOL)*\n\`${solAddress}\`\n\n` +
          `Send USDC to the relevant address to fund your account. Your balance will be credited automatically within minutes.\n\n` +
          `⚠️ Only send assets on the correct network to each address.`,
          {
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [{ text: "💰 View Wallet", callback_data: "wallet_deposit" }],
                [{ text: "← Back to Main", callback_data: "back_to_start" }],
              ],
            },
          }
        );
      } catch (err) {
        console.error("create wallet callback error:", err);
        return editMsgAny(chatId, msgId, "❌ Wallet creation failed. Please try again.", {
          reply_markup: { inline_keyboard: [[{ text: "← Back", callback_data: "back_to_start" }]] },
        });
      }
    }

    // --- back_to_start: restore the /start welcome photo caption ---
    if (data === "back_to_start") {
      bot.answerCallbackQuery(query.id);
      const chatId = query.message.chat.id;
      const msgId = query.message.message_id;
      const webAppUrl = `${process.env.MINI_APP_URL || "https://arken.blfdemo.online"}/?v=3&telegramId=${telegramId}`;
      let activeMarkets = 0, totalVolume = 0, userBalance = 0;
      try {
        const [activeCount, volumeAgg, walletDoc] = await Promise.all([
          Market.countDocuments({ active: true }),
          Market.aggregate([{ $group: { _id: null, total: { $sum: "$totalVolume" } } }]),
          userPublicWalletModel.findOne({ telegramId }),
        ]);
        activeMarkets = activeCount || 0;
        totalVolume = (volumeAgg && volumeAgg[0] ? volumeAgg[0].total : 0).toFixed(2);
        if (walletDoc) userBalance = Number(walletDoc.balance || 0).toFixed(2);
      } catch (e) {}
      return editMsgAny(chatId, msgId,
        `🚀 *Welcome to Arken Prediction Markets*\nThe ultimate prediction layer for the Solana ecosystem.\n\n📊 Live Markets: *${activeMarkets}* Active\n💰 Total Volume: *$${totalVolume}*\n💼 Your Balance: *$${userBalance}*\n\nWhat would you like to do?`,
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{ text: "🚀 Open Trading App", web_app: { url: webAppUrl } }],
              [
                { text: "📊 Active Markets", callback_data: "start_markets" },
                { text: "📥 Deposit", callback_data: "start_deposit" },
              ],
              [
                { text: "💼 Portfolio", callback_data: "start_portfolio" },
                { text: "⚙️ Settings", callback_data: "start_settings" },
              ],
            ],
          },
        }
      );
    }

    // --- back_to_wallet: restore the /wallet balance message ---
    if (data === "back_to_wallet") {
      bot.answerCallbackQuery(query.id);
      const chatId = query.message.chat.id;
      const msgId = query.message.message_id;
      const userWalletDoc = await userPublicWalletModel.findOne({ telegramId });
      const userObj = await User.findOne({ telegramId });
      const appBalance = Number(userWalletDoc?.balance || 0).toFixed(2);
      const holdBalance = Number(userWalletDoc?.holdBalance || 0).toFixed(2);
      let balanceText = `💰 *Your Wallet*\n\n📊 App Balance: *$${appBalance}*\n🔒 On Hold: *$${holdBalance}*\n\n*Deposit Addresses:*\n`;
      if (userWalletDoc && userWalletDoc.wallets && userWalletDoc.wallets.length) {
        for (const w of userWalletDoc.wallets) {
          balanceText += `• *${w.network}:* \`${w.address}\`\n`;
        }
      } else {
        balanceText += "No wallets yet.\n";
      }
      balanceText += `\n💸 Referral earnings: *$${Number(userObj?.referralEarnings || 0).toFixed(2)}*`;
      return bot.editMessageText(balanceText, {
        chat_id: chatId,
        message_id: msgId,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              { text: "📥 Deposit", callback_data: "wallet_deposit" },
              { text: "📤 Withdraw", callback_data: "wallet_withdraw" },
            ],
            [
              { text: "👥 My Referrals", callback_data: "wallet_referrals" },
              { text: "📋 Bet History", callback_data: "wallet_history" },
            ],
          ],
        },
      });
    }

  } catch (err) {
    console.error("Callback error:", err);
  }
});




    bot.onText(/\/trending(?:\s+(\d+))?/i, async (msg, match) => {
  try {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;

    const page = parseInt(match?.[1]) || 1;
    const skip = (page - 1) * PAGE_SIZE;

    if (msg.chat.type !== "private") {
      const group = await TelegramGroup.findOne({ groupId: chatId });
      if (!group || !group.bettingEnabled) {
        return bot.sendMessage(chatId, "❌ Betting is not enabled in this group");
      }
    }

    const totalCount = await PolyMarket.countDocuments({
      active: true,
      closed: false,
      endDate: { $gte: new Date() },
    });

    const trendingMarkets = await PolyMarket.find({
      active: true,
      closed: false,
      endDate: { $gte: new Date() },
    })
      .sort({ liquidity: -1, volume24hr: -1 })
      .skip(skip)
      .limit(PAGE_SIZE)
      .lean();

    if (!trendingMarkets.length) {
      return bot.sendMessage(chatId, "📭 No trending markets right now");
    }

    const inlineKeyboard = [];

    for (let i = 0; i < trendingMarkets.length; i += 2) {
      const row = [];

      for (let j = i; j < i + 2 && j < trendingMarkets.length; j++) {
        const bet = trendingMarkets[j];
        const icon = getCategoryIcon(bet.category);
        const marketUrl = `${process.env.MINI_APP_URL || "https://arken.blfdemo.online"}/market-details/${bet._id}?v=3&telegramId=${telegramId}`;

        row.push({
          text: `${icon} ${
            bet.question.length > 24
              ? bet.question.slice(0, 24) + "…"
              : bet.question
          }`,
          web_app: { url: marketUrl },
        });
      }

      inlineKeyboard.push(row);
    }

    const totalPages = Math.ceil(totalCount / PAGE_SIZE);
    const navRow = [];

    if (page > 1) {
      navRow.push({
        text: "⬅️ Previous",
        callback_data: `trending_page_${page - 1}`,
      });
    }

    if (page < totalPages) {
      navRow.push({
        text: "Next ➡️",
        callback_data: `trending_page_${page + 1}`,
      });
    }

    if (navRow.length) {
      inlineKeyboard.push(navRow);
    }

    await bot.sendMessage(
      chatId,
      `🔥 *Trending Markets*\nPage ${page} of ${totalPages}\nTap a market to open 👇`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: inlineKeyboard,
        },
      }
    );
  } catch (err) {
    console.error("/trending error:", err);
  }
});

//     bot.onText(/\/trending/i, async (msg) => {
//   try {
//     const chatId = msg.chat.id;
//     const telegramId = msg.from.id;

//     if (msg.chat.type !== "private") {
//       const group = await TelegramGroup.findOne({ groupId: chatId });
//       if (!group || !group.bettingEnabled) {
//         return bot.sendMessage(chatId, "❌ Betting is not enabled in this group");
//       }
//     }

//     const trendingMarkets = await PolyMarket.find({
//       active: true,
//       closed: false,
//       endDate: { $gte: new Date() },
//     })
//       .sort({ liquidity: -1, volume24hr: -1 })
//       .limit(20)
//       .lean();

//     if (!trendingMarkets.length) {
//       return bot.sendMessage(chatId, "📭 No trending markets right now");
//     }

//     const inlineKeyboard = [];

//     for (let i = 0; i < trendingMarkets.length; i += 2) {
//       const row = [];

//       for (let j = i; j < i + 2 && j < trendingMarkets.length; j++) {
//         const bet = trendingMarkets[j];
//         const token = generateJwt(telegramId, chatId, bet._id);

//         const payload = Buffer.from(
//           JSON.stringify({ marketId: bet._id, token })
//         ).toString("base64");

//         const url = `https://t.me/Arkenpredictionbot?startapp=${payload}`;
//         const icon = getCategoryIcon(bet.category);

//         row.push({
//           text: `${icon} ${
//             bet.question.length > 24
//               ? bet.question.slice(0, 24) + "…"
//               : bet.question
//           }`,
//           url,
//         });
//       }

//       inlineKeyboard.push(row);
//     }

//     await bot.sendMessage(
//       chatId,
//       "🔥 *Trending Markets*\nTap a market to open 👇",
//       {
//         parse_mode: "Markdown",
//         reply_markup: {
//           inline_keyboard: inlineKeyboard,
//         },
//       }
//     );
//   } catch (err) {
//     console.error("/trending error:", err);
//   }
// });


//     bot.onText(/\/search (.+)/i, async (msg, match) => {
//       try {
//         const chatId = msg.chat.id;
//         const telegramId = msg.from.id;
//         const keyword = match[1].trim().toLowerCase();

//         if (msg.chat.type !== "private") {
//           const group = await TelegramGroup.findOne({ groupId: chatId });
//           if (!group || !group.bettingEnabled) {
//             return bot.sendMessage(chatId, "❌ Betting is not enabled in this group");
//           }
//         }

//         // Check if keyword matches a CATEGORY
//         const categoryNames = Object.keys(CATEGORY_SUBCATEGORY_MAP);
//         let matchedCategory = null;

//         for (const cat of categoryNames) {
//           if (cat.toLowerCase() === keyword || 
//               (cat === "ClimateAndScience" && (keyword === "climate" || keyword === "science")) ||
//               (cat === "WorldEvents" && (keyword === "world" || keyword === "events"))) {
//             matchedCategory = cat;
//             break;
//           }
//         }

//         // If category matched, show subcategories
//         if (matchedCategory) {
//           const subcategoryMap = CATEGORY_SUBCATEGORY_MAP[matchedCategory];
//           const subcategoryNames = Object.keys(subcategoryMap);

//           if (!subcategoryNames.length) {
//             return bot.sendMessage(chatId, `📭 No subcategories found for *${matchedCategory}*`, {
//               parse_mode: "Markdown"
//             });
//           }

//           // Create inline keyboard with subcategories (2 per row)
//           const inlineKeyboard = [];
//           for (let i = 0; i < subcategoryNames.length; i += 2) {
//             const row = [];
//             for (let j = i; j < i + 2 && j < subcategoryNames.length; j++) {
//               const subName = subcategoryNames[j];
//               row.push({
//                 text: subName,
//                 callback_data: `search_sub_${matchedCategory}_${subName}`
//               });
//             }
//             inlineKeyboard.push(row);
//           }

//           return bot.sendMessage(
//             chatId,
//             `🔍 *${matchedCategory} Subcategories*\nSelect a subcategory:`,
//             {
//               parse_mode: "Markdown",
//               reply_markup: {
//                 inline_keyboard: inlineKeyboard
//               }
//             }
//           );
//         }

//         // Otherwise, search normally (question, description, subcategory keywords)
//         const regex = new RegExp(keyword, "i");

//         const manual = await Market.find({
//           active: true,
//           endDate: { $gte: new Date() },
//           $or: [
//             { question: regex },
//             { description: regex },
//             { category: regex },
//             { subcategory: regex }
//           ]
//         }).limit(10).lean();

//         const poly = await PolyMarket.find({
//           active: true,
//           closed: false,
//           endDate: { $gte: new Date() },
//           $or: [
//             { question: regex },
//             { category: regex },
//             { subcategory: regex }
//           ]
//         }).limit(10).lean();

//         const results = [...manual, ...poly];

//         if (!results.length) {
//           return bot.sendMessage(chatId, `🔍 No results for *${keyword}*`, {
//             parse_mode: "Markdown"
//           });
//         }

//         const inlineKeyboard = [];

//         for (let i = 0; i < results.length; i += 2) {
//           const row = [];

//           for (let j = i; j < i + 2 && j < results.length; j++) {
//             const bet = results[j];
//             const token = generateJwt(telegramId, chatId, bet._id);
//             const payload = Buffer.from(
//   JSON.stringify({ marketId: bet._id, token })
// ).toString("base64");

// const url = `https://t.me/Arkenpredictionbot?startapp=${payload}`;
//             // const url = `https://arken.blfdemo.online/market-details/${bet._id}?token=${token}`;

//             const icon = getCategoryIcon(bet.category);

//             row.push({
//               text: `${icon} ${
//                 bet.question.length > 24
//                   ? bet.question.slice(0, 24) + "…"
//                   : bet.question
//               }`,
//               url
//             });
//           }

//           inlineKeyboard.push(row);
//         }

//         await bot.sendMessage(
//           chatId,
//           "🟢 *Search Results*\nTap a market to open 👇",
//           {
//             parse_mode: "Markdown",
//             reply_markup: {
//               inline_keyboard: inlineKeyboard
//             }
//           }
//         );

//       } catch (err) {
//         console.error("/search error:", err);
//       }
//     });



const SEARCH_PAGE_SIZE = 6;

bot.onText(/\/search (.+)/i, async (msg, match) => {

  try {

    const chatId = msg.chat.id;
    const telegramId = msg.from.id;

    const input = match[1].trim();
    const parts = input.split(" ");

    const categoryKeyword = parts[0].toLowerCase();
    const keyword = parts.slice(1).join(" ").toLowerCase();

    if (msg.chat.type !== "private") {

      const group = await TelegramGroup.findOne({ groupId: chatId });

      if (!group || !group.bettingEnabled) {
        return bot.sendMessage(chatId, "❌ Betting is not enabled in this group");
      }

    }

    const categoryNames = Object.keys(CATEGORY_SUBCATEGORY_MAP);

    let matchedCategory = null;

    for (const cat of categoryNames) {

      if (
        cat.toLowerCase() === categoryKeyword ||
        (cat === "ClimateAndScience" &&
          (categoryKeyword === "climate" || categoryKeyword === "science")) ||
        (cat === "WorldEvents" &&
          (categoryKeyword === "world" || categoryKeyword === "events"))
      ) {

        matchedCategory = cat;
        break;

      }

    }

    // CASE 1: only category
    if (matchedCategory && !keyword) {

      const subcategoryMap = CATEGORY_SUBCATEGORY_MAP[matchedCategory];
      const subcategoryNames = Object.keys(subcategoryMap);

      if (!subcategoryNames.length) {

        return bot.sendMessage(
          chatId,
          `📭 No subcategories found for *${matchedCategory}*`,
          { parse_mode: "Markdown" }
        );

      }

      const inlineKeyboard = [];

      for (let i = 0; i < subcategoryNames.length; i += 2) {

        const row = [];

        for (let j = i; j < i + 2 && j < subcategoryNames.length; j++) {

          const subName = subcategoryNames[j];

          row.push({
            text: subName,
            callback_data: `search_sub_${matchedCategory}_${subName}_page_1`,
          });

        }

        inlineKeyboard.push(row);

      }

      return bot.sendMessage(
        chatId,
        `🔍 *${matchedCategory} Subcategories*`,
        {
          parse_mode: "Markdown",
          reply_markup: { inline_keyboard: inlineKeyboard },
        }
      );

    }

    // CASE 2 & 3 search results

    const regex = new RegExp(keyword || categoryKeyword, "i");

    const queryManual = {
      active: true,
      endDate: { $gte: new Date() },
      ...(matchedCategory && { category: matchedCategory }),
      $or: [
        { question: regex },
        { description: regex },
        { category: regex },
        { subcategory: regex },
      ],
    };

    const queryPoly = {
      active: true,
      closed: false,
      endDate: { $gte: new Date() },
      ...(matchedCategory && { category: matchedCategory }),
      $or: [
        { question: regex },
        { category: regex },
        { subcategory: regex },
      ],
    };

    const totalManual = await Market.countDocuments(queryManual);
    const totalPoly = await PolyMarket.countDocuments(queryPoly);

    const totalCount = totalManual + totalPoly;

    const manual = await Market.find(queryManual)
      .limit(SEARCH_PAGE_SIZE)
      .lean();

    const poly = await PolyMarket.find(queryPoly)
      .limit(SEARCH_PAGE_SIZE)
      .lean();

    const results = [...manual, ...poly].slice(0, SEARCH_PAGE_SIZE);

    if (!results.length) {

      return bot.sendMessage(
        chatId,
        `🔍 No results found`,
        { parse_mode: "Markdown" }
      );

    }

    const inlineKeyboard = [];

    for (let i = 0; i < results.length; i += 2) {

      const row = [];

      for (let j = i; j < i + 2 && j < results.length; j++) {

        const bet = results[j];
        const icon = getCategoryIcon(bet.category);
        const marketUrl = `${process.env.MINI_APP_URL || "https://arken.blfdemo.online"}/market-details/${bet._id}?v=3&telegramId=${telegramId}`;

        row.push({
          text: `${icon} ${
            bet.question.length > 24
              ? bet.question.slice(0, 24) + "…"
              : bet.question
          }`,
          web_app: { url: marketUrl },
        });

      }

      inlineKeyboard.push(row);

    }

    const totalPages = Math.ceil(totalCount / SEARCH_PAGE_SIZE);

    if (totalPages > 1) {

      inlineKeyboard.push([
        {
          text: "Next ➡️",
          callback_data: `search_page_${encodeURIComponent(input)}_2`,
        },
      ]);

    }

    await bot.sendMessage(
      chatId,
      `🟢 *Search Results*\nPage 1 of ${totalPages}`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: inlineKeyboard,
        },
      }
    );

  } catch (err) {

    console.error(err);

  }

});




    // ─── /createmarket command (conversational flow) ───────────────────────────
    // State is stored in-memory: { step, data }
    const marketCreationState = new Map(); // key: telegramId

    bot.onText(/\/createmarket/, async (msg) => {
      if (msg.chat.type !== "private") {
        return bot.sendMessage(msg.chat.id, "⚠️ Please use /createmarket in a private chat with the bot.");
      }
      const telegramId = msg.from.id;
      marketCreationState.set(telegramId, { step: "visibility", data: {} });
      bot.sendMessage(msg.chat.id,
        "🏪 *Create a New Market*\n\nStep 1/5: Is this market *public* or *private*?\n\n" +
        "• Public — anyone can see and bet\n• Private — only users you invite",
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [[
              { text: "🌍 Public", callback_data: "cm_visibility_public" },
              { text: "🔒 Private", callback_data: "cm_visibility_private" },
            ]],
          },
        }
      );
    });

    // Listen for text messages to handle conversational market creation steps
    bot.on("message", async (msg) => {
      if (!msg.text || msg.text.startsWith("/")) return;
      const telegramId = msg.from.id;
      const chatId = msg.chat.id;
      const state = marketCreationState.get(telegramId);
      if (!state) return;

      if (state.step === "question") {
        state.data.question = msg.text.trim();
        state.step = "outcomes";
        marketCreationState.set(telegramId, state);
        return bot.sendMessage(chatId,
          "Step 3/5: What are the *outcomes*?\n\nSend them comma-separated.\nExample: `Yes, No` or `Team A, Team B, Draw`",
          { parse_mode: "Markdown" }
        );
      }

      if (state.step === "outcomes") {
        const outcomes = msg.text.split(",").map(o => o.trim()).filter(Boolean);
        if (outcomes.length < 2) {
          return bot.sendMessage(chatId, "⚠️ Please enter at least 2 outcomes, separated by commas.");
        }
        state.data.outcomes = outcomes;
        state.step = "endDate";
        marketCreationState.set(telegramId, state);
        return bot.sendMessage(chatId,
          "Step 4/5: When does this market *end*?\n\nSend date as: `YYYY-MM-DD`\nExample: `2026-03-31`",
          { parse_mode: "Markdown" }
        );
      }

      if (state.step === "endDate") {
        const parsed = new Date(msg.text.trim());
        if (isNaN(parsed.getTime()) || parsed <= new Date()) {
          return bot.sendMessage(chatId, "⚠️ Invalid date or date is in the past. Use format: YYYY-MM-DD");
        }
        state.data.endDate = parsed;
        state.step = "oracleType";
        marketCreationState.set(telegramId, state);
        return bot.sendMessage(chatId,
          "Step 5/5: How should this market be *resolved*?",
          {
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [[
                { text: "👤 Manual (Admin)", callback_data: "cm_oracle_manual" },
                { text: "⛓ UMA Oracle", callback_data: "cm_oracle_uma" },
              ]],
            },
          }
        );
      }
    });

    // Handle /createmarket callback steps
    bot.on("callback_query", async (query) => {
      // Note: this is a SECOND callback_query listener — handles only createmarket flow
      // The first one (bot.on) at line ~1007 handles the rest
      const telegramId = query.from.id;
      const chatId = query.message.chat.id;
      const data = query.data;
      const state = marketCreationState.get(telegramId);

      if (data === "cm_visibility_public" || data === "cm_visibility_private") {
        if (!state) return bot.answerCallbackQuery(query.id);
        state.data.isPrivate = data === "cm_visibility_private";
        state.step = "question";
        marketCreationState.set(telegramId, state);
        bot.answerCallbackQuery(query.id);
        return bot.sendMessage(chatId,
          `Step 2/5: What is your *market question*?\n\nExample: "Will BTC be above $100k on March 31, 2026?"`,
          { parse_mode: "Markdown" }
        );
      }

      if (data === "cm_oracle_manual" || data === "cm_oracle_uma") {
        if (!state || state.step !== "oracleType") return bot.answerCallbackQuery(query.id);
        state.data.oracleType = data === "cm_oracle_uma" ? "uma" : "manual";
        marketCreationState.delete(telegramId);
        bot.answerCallbackQuery(query.id);

        // Save market to DB as "pending"
        try {
          const user = await User.findOne({ telegramId });
          const newMarket = await Market.create({
            question: state.data.question,
            outcomes: state.data.outcomes,
            outcomePrices: state.data.outcomes.map(() => 0),
            chancePercents: state.data.outcomes.map(() => Math.floor(100 / state.data.outcomes.length)),
            endDate: state.data.endDate,
            isPrivate: state.data.isPrivate,
            creatorTelegramId: telegramId,
            oracleType: state.data.oracleType,
            marketStatus: "pending",
            active: false,
            currency: "USDC",
            chancePercents: (() => {
              const n = state.data.outcomes.length;
              const spread = 3;
              const base = parseFloat((100 / n).toFixed(1));
              const half = parseFloat((spread / 2).toFixed(1));
              const p = Array.from({ length: n }, () => base);
              p[0] = parseFloat((p[0] + half).toFixed(1));
              p[n - 1] = parseFloat((p[n - 1] - half).toFixed(1));
              const drift = parseFloat((100 - p.reduce((a, b) => a + b, 0)).toFixed(1));
              if (drift !== 0) p[n - 1] = parseFloat((p[n - 1] + drift).toFixed(1));
              return p;
            })(),
          });

          let replyText = `✅ *Market submitted for review!*\n\n` +
            `📝 "${state.data.question}"\n` +
            `🏁 Outcomes: ${state.data.outcomes.join(", ")}\n` +
            `📅 Ends: ${state.data.endDate.toISOString().split("T")[0]}\n` +
            `🔮 Oracle: ${state.data.oracleType === "uma" ? "UMA On-chain" : "Manual (Admin)"}\n` +
            `🔒 Visibility: ${state.data.isPrivate ? "Private" : "Public"}\n\n` +
            `Admin will review and activate it shortly.`;

          if (state.data.isPrivate) {
            const me = await bot.getMe();
            const inviteLink = `https://t.me/${me.username}?start=join_${newMarket._id}`;
            replyText += `\n\n🔗 *Your invite link* (share with participants):\n\`${inviteLink}\``;
          }

          bot.sendMessage(chatId, replyText, { parse_mode: "Markdown" });
        } catch (err) {
          console.error("Market creation error:", err);
          bot.sendMessage(chatId, "❌ Failed to create market. Please try again.");
        }
      }
    });

    // --- /mymarkets command (requires connected wallet) ---
    bot.onText(/\/mymarkets/, async (msg) => {
      const chatId = msg.chat.id;
      const telegramId = msg.from.id;
      try {
        if (!await requireWallet(telegramId, chatId)) return;
        const myMarkets = await Market.find({ creatorTelegramId: telegramId })
          .sort({ createdAt: -1 })
          .lean();

        if (!myMarkets.length) {
          return bot.sendMessage(chatId, "📊 You haven't created any markets yet.\n\nUse /createmarket to create one!");
        }

        let text = "📊 *Your Markets*\n\n";
        for (const m of myMarkets) {
          const statusEmoji = m.marketStatus === "active" ? "✅" :
                              m.marketStatus === "resolved" ? "🏁" :
                              m.marketStatus === "pending" ? "⏳" : "❌";
          text += `${statusEmoji} *${m.question.substring(0, 60)}*\n`;
          text += `   Status: ${m.marketStatus} | Volume: ${m.totalVolume || 0}\n`;
          text += `   Creator fee earned: tracked in /wallet\n\n`;
        }

        bot.sendMessage(chatId, text, { parse_mode: "Markdown" });
      } catch (err) {
        console.error("/mymarkets error:", err);
        bot.sendMessage(chatId, "❌ Could not load your markets.");
      }
    });

    // --- /referrals command (requires connected wallet) ---
    bot.onText(/\/referrals/, async (msg) => {
      const chatId = msg.chat.id;
      const telegramId = msg.from.id;
      try {
        if (!await requireWallet(telegramId, chatId)) return;
        const Referral = require("./models/referral");
        const user = await User.findOne({ telegramId });

        const referrals = await Referral.find({ referrerId: telegramId });
        const totalEarned = referrals.reduce((sum, r) => sum + r.totalEarned, 0);
        const count = referrals.length;
        const referralLink = `https://t.me/${(await bot.getMe()).username}?start=ref_${telegramId}`;

        bot.sendMessage(
          chatId,
          `👥 *Your Referral Dashboard*\n\n` +
          `Referred users: *${count}*\n` +
          `Total earned: *${totalEarned.toFixed(4)}*\n\n` +
          `🔗 Your referral link:\n\`${referralLink}\`\n\n` +
          `Share this link — you earn *35% of the 3% platform fee* on every trade they make.`,
          { parse_mode: "Markdown" }
        );
      } catch (err) {
        console.error("/referrals error:", err);
        bot.sendMessage(chatId, "❌ Could not load referral data.");
      }
    });

    // --- /createwallet command — creates both ARB and SOL wallets ---
    bot.onText(/\/createwallet/, async (msg) => {
      const chatId = msg.chat.id;
      const telegramId = msg.from.id;
      if (msg.chat.type !== "private") {
        return bot.sendMessage(chatId, "Please use /createwallet in a private chat with me.");
      }
      try {
        const [arbResult, solResult] = await Promise.all([
          creat_new_wallet({ telegramId: String(telegramId), network: "ARB" }),
          creat_new_wallet({ telegramId: String(telegramId), network: "SOL" }),
        ]);
        const arbAddress = arbResult.data?.address || "N/A";
        const solAddress = solResult.data?.address || "N/A";
        bot.sendMessage(chatId,
          `✅ *Wallets Ready*\n\n` +
          `🔷 *Arbitrum (USDC/ETH)*\n\`${arbAddress}\`\n\n` +
          `💎 *Solana (USDC/SOL)*\n\`${solAddress}\`\n\n` +
          `Send USDC to the relevant address to fund your account.\n\n` +
          `⚠️ Only send assets on the correct network to each address.`,
          {
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [[{ text: "💰 View Wallet", callback_data: "wallet_deposit" }]],
            },
          }
        );
      } catch (err) {
        console.error("/createwallet error:", err);
        bot.sendMessage(chatId, "❌ Wallet creation failed. Please try again.");
      }
    });

    // --- /wallet command (requires connected wallet, private chat only) ---
    bot.onText(/\/wallet/, async (msg) => {
      const chatId = msg.chat.id;
      const telegramId = msg.from.id;
      try {
        // /wallet only works in private chat — groups expose balances publicly
        if (msg.chat.type !== "private") {
          return bot.sendMessage(chatId,
            "💰 *Wallet* is a private command — tap below to open it in DM.",
            {
              parse_mode: "Markdown",
              reply_markup: {
                inline_keyboard: [[
                  { text: "💰 Open My Wallet", url: `https://t.me/${(await bot.getMe()).username}?start=wallet` },
                ]],
              },
            }
          );
        }
        if (!await requireWallet(telegramId, chatId)) return;
        const userWalletDoc = await userPublicWalletModel.findOne({ telegramId });
        const user = await User.findOne({ telegramId });

        const appBalance = Number(userWalletDoc?.balance || 0).toFixed(2);
        const holdBalance = Number(userWalletDoc?.holdBalance || 0).toFixed(2);

        let balanceText = `💰 *Your Wallet*\n\n`;
        balanceText += `📊 App Balance: *$${appBalance}*\n`;
        balanceText += `🔒 On Hold: *$${holdBalance}*\n\n`;
        balanceText += `*Deposit Addresses:*\n`;

        if (userWalletDoc && userWalletDoc.wallets && userWalletDoc.wallets.length) {
          for (const w of userWalletDoc.wallets) {
            balanceText += `• *${w.network}:* \`${w.address}\`\n`;
          }
        } else {
          balanceText += "No wallets yet.\n";
        }

        balanceText += `\n💸 Referral earnings: *$${Number(user?.referralEarnings || 0).toFixed(2)}*`;

        bot.sendMessage(chatId, balanceText, {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [
                { text: "📥 Deposit", callback_data: "wallet_deposit" },
                { text: "📤 Withdraw", callback_data: "wallet_withdraw" },
              ],
              [
                { text: "👥 My Referrals", callback_data: "wallet_referrals" },
                { text: "📋 Bet History", callback_data: "wallet_history" },
              ],
              [
                { text: "🔑 Export Private Key", callback_data: "export_key" },
              ],
            ],
          },
        });
      } catch (err) {
        console.error("/wallet error:", err);
        bot.sendMessage(chatId, "❌ Could not load wallet data.");
      }
    });

    // --- /history command (requires connected wallet) ---
    bot.onText(/\/history/, async (msg) => {
      const chatId = msg.chat.id;
      const telegramId = msg.from.id;
      try {
        if (!await requireWallet(telegramId, chatId)) return;
        const Prediction = require("./models/predictions");
        const bets = await Prediction.find({ telegramId })
          .sort({ createdAt: -1 })
          .limit(10)
          .lean();

        if (!bets.length) {
          return bot.sendMessage(chatId, "📋 No bets placed yet.");
        }

        let text = "📋 *Your Last 10 Bets*\n\n";
        for (const b of bets) {
          const statusEmoji = b.status === "WON" ? "✅" : b.status === "LOST" ? "❌" : "⏳";
          text += `${statusEmoji} *${b.outcomeLabel}* — ${b.amount} ${b.currency || ""}\n`;
          text += `   Odds: ${b.odds} | Status: ${b.status}\n`;
          if (b.question) text += `   _${b.question.substring(0, 60)}..._\n`;
          text += "\n";
        }

        bot.sendMessage(chatId, text, { parse_mode: "Markdown" });
      } catch (err) {
        console.error("/history error:", err);
        bot.sendMessage(chatId, "❌ Could not load bet history.");
      }
    });

    // --- /dashboard command — wallet-gated personal hub ---
    // Accessible only to users with a connected wallet.
    // Centralises /wallet, /history, /mymarkets and the mini-app link in one place.
    bot.onText(/\/dashboard/, async (msg) => {
      const chatId = msg.chat.id;
      const telegramId = msg.from.id;
      try {
        if (!await requireWallet(telegramId, chatId)) return;

        const walletDoc = await userWalletDB.findOne({ telegramId });
        const user = await User.findOne({ telegramId });

        let balanceLine = "No balances yet.";
        if (walletDoc && walletDoc.wallets && walletDoc.wallets.length) {
          balanceLine = walletDoc.wallets
            .map(w => `• *${w.currencySymbol}:* ${Number(w.amount).toFixed(4)}`)
            .join("\n");
        }

        const webAppUrl = `${process.env.MINI_APP_URL || "https://arken.blfdemo.online"}/?v=3&telegramId=${telegramId}`;

        bot.sendMessage(chatId,
          `👤 *Your Arken Dashboard*\n\n💼 *Balances*\n${balanceLine}\n\n🔗 Referral earnings: *${Number(user.referralEarnings || 0).toFixed(4)}*\n\nUse the buttons below or open the app for full functionality.`,
          {
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [{ text: "🚀 Open Trading App", web_app: { url: webAppUrl } }],
                [
                  { text: "📋 Bet History", callback_data: "wallet_history" },
                  { text: "📊 My Markets", callback_data: "wallet_mymarkets" },
                ],
                [
                  { text: "👥 Referrals", callback_data: "wallet_referrals" },
                ],
              ],
            },
          },
        );
      } catch (err) {
        console.error("/dashboard error:", err);
        bot.sendMessage(chatId, "❌ Could not load dashboard.");
      }
    });

    return bot;
  } catch (error) {
    console.error("❌ Telegram bot init error:", error);
    throw error;
  }
}


// async function initializeTelegramBot() {
//   try {
//     console.log("🚀 Initializing Telegram bot (POLLING MODE)...");

//     bot = new TelegramBot(BOT_TOKEN, { polling: true });
//     console.log("✅ Telegram bot initialized with polling");

//     bot.onText(/\/start/, async (msg) => {
//       const chatId = msg.chat.id;
//       await storeTelegramUser(msg);

//       const webAppUrl = `${process.env.MINI_APP_URL || "https://arken.blfdemo.online"}/?v=3&telegramId=${chatId}`;

//       bot.sendPhoto(
//         chatId,
//         "https://res.cloudinary.com/dqtdd1frp/image/upload/v1765269718/_group__nwyhgf.webp",
//         {
//           caption: `🚀 *Welcome to Prediction Trading Platform!*

// ✅ Connect your wallet  
// ✅ Fund your account  
// ✅ Start placing predictions  

// 👇 Click below to get started`,
//           parse_mode: "Markdown",
//           reply_markup: {
//             inline_keyboard: [[
//               { text: "🔗 Connect Wallet", web_app: { url: webAppUrl } }
//             ]]
//           }
//         }
//       );
//     });

//     bot.on("my_chat_member", async (msg) => {
//       try {
//         const chat = msg.chat;
//         const newStatus = msg.new_chat_member.status;

//         if (newStatus === "administrator" && chat.type !== "private") {
//           const groupId = chat.id;

//           const exists = await TelegramGroup.findOne({ groupId });
//           if (!exists) {
//             await TelegramGroup.create({
//               groupId,
//               groupTitle: chat.title,
//               groupOwnerId: msg.from.id,
//               commissionPercent: 5,
//               bettingEnabled: false,
//               botIsAdmin: true,
//             });

//             bot.sendMessage(
//               groupId,
//               "✅ Bot activated!\nAdmin can enable betting using /enablebets"
//             );
//           }
//         }
//       } catch (err) {
//         console.error("Group store error:", err.message);
//       }
//     });

//     bot.onText(/\/enablebets/, async (msg) => {
//       const groupId = msg.chat.id;
//       const userId = msg.from.id;

//       const group = await TelegramGroup.findOne({ groupId });
//       if (!group) return;

//       if (group.groupOwnerId !== userId) {
//         return bot.sendMessage(groupId, "❌ Only group owner can enable betting");
//       }

//       group.bettingEnabled = true;
//       await group.save();
//       bot.sendMessage(groupId, "🎯 Betting enabled in this group!");
//     });

//     bot.onText(/\/bets/, async (msg) => {
//       const groupId = msg.chat.id;
//       const group = await TelegramGroup.findOne({ groupId });

//       if (!group || !group.bettingEnabled) {
//         return bot.sendMessage(groupId, "❌ Betting is not enabled in this group");
//       }

//       bot.sendMessage(groupId, "📊 *Select Bet Category*", {
//         parse_mode: "Markdown",
//         reply_markup: {
//           inline_keyboard: [
//             [
//               { text: "📋 All", callback_data: "bets_all" },
//               { text: "🪙 Crypto", callback_data: "bets_crypto" },
//               { text: "📦 Others", callback_data: "bets_others" }
//             ]
//           ]
//         }
//       });
//     });

//     bot.on("callback_query", async (query) => {
//       try {
//         const groupId = query.message.chat.id;
//         const telegramId = query.from.id;

//         let filter = {};
//         if (query.data === "bets_crypto") filter.category = "Crypto";
//         if (query.data === "bets_others") filter.category = "Other";

//         const manual = await Market.find({
//           active: true,
//           endDate: { $gte: new Date() },
//           ...filter
//         }).limit(20).lean();

//         const poly = await PolyMarket.find({
//           active: true,
//           closed: false,
//           endDate: { $gte: new Date() },
//           ...filter
//         }).limit(20).lean();

//         const merged = [...manual, ...poly];
//         if (!merged.length) {
//           bot.answerCallbackQuery(query.id);
//           return bot.sendMessage(groupId, "📭 No bets found");
//         }

//         for (const bet of merged) {
//           const token = generateJwt(telegramId, groupId, bet._id);
//           const url = `https://arken.blfdemo.online/market-details/${bet._id}?token=${token}`;

//           await bot.sendMessage(groupId, `📊 *${bet.question}*`, {
//             parse_mode: "Markdown",
//             reply_markup: {
//               inline_keyboard: [[{ text: "👉 Place Bet", url }]]
//             }
//           });
//         }

//         bot.answerCallbackQuery(query.id);
//       } catch (err) {
//         console.error("Callback error:", err);
//       }
//     });


// bot.onText(/\/search (.+)/i, async (msg, match) => {
//   try {
//     const chatId = msg.chat.id;
//     const telegramId = msg.from.id;
//     const keyword = match[1];

//     if (msg.chat.type !== "private") {
//       const group = await TelegramGroup.findOne({ groupId: chatId });
//       if (!group || !group.bettingEnabled) {
//         return bot.sendMessage(chatId, "❌ Betting is not enabled in this group");
//       }
//     }

//     const regex = new RegExp(keyword, "i");

//     const manual = await Market.find({
//       active: true,
//       endDate: { $gte: new Date() },
//       $or: [
//         { question: regex },
//         { description: regex },
//         { category: regex },
//         { subcategory: regex }
//       ]
//     }).limit(10).lean();

//     const poly = await PolyMarket.find({
//       active: true,
//       closed: false,
//       endDate: { $gte: new Date() },
//       $or: [
//         { question: regex },
//         { category: regex },
//         { subcategory: regex }
//       ]
//     }).limit(10).lean();

//     const results = [...manual, ...poly];

//     if (!results.length) {
//       return bot.sendMessage(chatId, `🔍 No results for *${keyword}*`, {
//         parse_mode: "Markdown"
//       });
//     }

//     const inlineKeyboard = [];

//     for (let i = 0; i < results.length; i += 2) {
//       const row = [];

//       for (let j = i; j < i + 2 && j < results.length; j++) {
//         const bet = results[j];
//         const token = generateJwt(telegramId, chatId, bet._id);
//         const url = `https://arken.blfdemo.online/market-details/${bet._id}?token=${token}`;

//         const icon = getCategoryIcon(bet.category);

//         row.push({
//           text: `${icon} ${
//             bet.question.length > 24
//               ? bet.question.slice(0, 24) + "…"
//               : bet.question
//           }`,
//           url
//         });
//       }

//       inlineKeyboard.push(row);
//     }

//     await bot.sendMessage(
//       chatId,
//       "🟢 *Search Results*\nTap a market to open 👇",
//       {
//         parse_mode: "Markdown",
//         reply_markup: {
//           inline_keyboard: inlineKeyboard
//         }
//       }
//     );

//   } catch (err) {
//     console.error("/search error:", err);
//   }
// });

//     return bot;
//   } catch (error) {
//     console.error("❌ Telegram bot init error:", error);
//     throw error;
//   }
// }

const PORT = process.env.PORT || 3002;

if (process.env.USE_SSL === "true") {
  const options = {
    key: fs.readFileSync(process.env.SSL_KEY_PATH),
    cert: fs.readFileSync(process.env.SSL_CERT_PATH),
    requestCert: false
  };
  server = https.createServer(options, app);
} else {
  server = http.createServer(app);
}

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "arken-consumer-1", timestamp: new Date().toISOString() });
});

async function seedCurrencies() {
  try {
    const exists = await currencyDB.find({}).lean();
    if (exists.length > 0) {
      console.log("✅ Currencies already exist — skipping seed");
      return;
    }

    const seeds = [
      {
        currencyName: "Solana",
        currencySymbol: "SOL",
        walletSymbol: "SOL",
        currencyType: "1",
        coinType: "2",
        status: "Active",
        depositStatus: "Active",
        withdrawStatus: "Active",
        minDepositLimit: 0.01,
        maxDepositLimit: 1000,
      },
      {
        currencyName: "USD Coin",
        currencySymbol: "USDC",
        walletSymbol: "USDC",
        currencyType: "1",
        coinType: "2",
        status: "Active",
        depositStatus: "Active",
        withdrawStatus: "Active",
        minDepositLimit: 0.01,
        maxDepositLimit: 1000,
      },
      {
        currencyName: "Arken Token",
        currencySymbol: "TOKEN",
        walletSymbol: "TOKEN",
        currencyType: "1",
        coinType: "2",
        status: "Active",
        depositStatus: "Active",
        withdrawStatus: "Active",
        minDepositLimit: 0.01,
        maxDepositLimit: 1000,
      },
      {
        currencyName: "Arbitrum",
        currencySymbol: "ARB",
        walletSymbol: "ARB",
        currencyType: "1",
        coinType: "2",
        status: "Active",
        depositStatus: "Active",
        withdrawStatus: "Active",
        minDepositLimit: 0.01,
        maxDepositLimit: 1000,
      },
    ];

    await currencyDB.insertMany(seeds);
    console.log("✅ Currencies seeded");
  } catch (err) {
    console.error("❌ Currency seed failed:", err.message);
  }
}

async function migrateWalletBalances() {
  try {
    const docs = await userPublicWalletModel.find({ balance: { $in: [0, null] } }).lean();
    let migrated = 0;
    for (const doc of docs) {
      const total = (doc.wallets || []).reduce((sum, w) => sum + (w.amount || 0), 0);
      if (total > 0) {
        await userPublicWalletModel.updateOne({ _id: doc._id }, { $set: { balance: total } });
        migrated++;
      }
    }
    console.log(`✅ Balance migration: ${migrated} documents updated`);
  } catch (err) {
    console.error("❌ Balance migration failed:", err.message);
  }
}

async function connectRabbitWithRetry(attempt = 1) {
  try {
    await connectRabbit(startAuthConsumer);
    console.log('Connected to RabbitMQ');
  } catch (err) {
    const delay = Math.min(5000 * attempt, 30000);
    console.error(`RabbitMQ not ready (attempt ${attempt}): ${err.message} — retrying in ${delay / 1000}s`);
    await new Promise(r => setTimeout(r, delay));
    return connectRabbitWithRetry(attempt + 1);
  }
}

async function startService() {
  try {
    await connectRabbitWithRetry();

    await seedCurrencies();

    await migrateWalletBalances();

    startAuthConsumer();

    await initializeTelegramBot();

    // After the bot is ready, register the deposit success callback.
    // When a deposit is recorded, the bot sends a message with a web_app button —
    // the only 100% reliable way to open the Telegram mini-app from within Telegram.
    const MINI_APP_BASE = process.env.MINI_APP_URL || "https://arken.blfdemo.online";
    setDepositSuccessCallback(async (telegramId, amount, currency) => {
      try {
        if (!bot || !telegramId) return;
        const webAppUrl = `${MINI_APP_BASE}/?v=3&telegramId=${telegramId}`;
        await bot.sendMessage(
          telegramId,
          `✅ *Deposit Confirmed!*\n\nYour *${amount} ${currency}* deposit has been received and your balance updated.\n\nTap the button below to open Arken.`,
          {
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [[
                { text: "🚀 Open Arken", web_app: { url: webAppUrl } }
              ]],
            },
          }
        );
      } catch (err) {
        console.error("Deposit notification failed:", err.message);
      }
    });

    server.listen(PORT, async () => {
      console.log(`Auth Consumer Service running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start Auth Consumer Service:', err);
    process.exit(1); // Non-RabbitMQ startup failure — let Docker restart
  }
}

process.once("SIGINT", () => {
  if (bot) bot.stopPolling();
  server.close(() => console.log("Server stopped gracefully"));
});

process.once("SIGTERM", () => {
  if (bot) bot.stopPolling();
  server.close(() => console.log("Server stopped gracefully"));
});

startService();
