const common = require("../utils/common");
var adminDB = require("../models/admin");
var adminloginhistoryDB = require("../models/adminloginhistory");
var mailtempDB = require("../models/mailtemplate");
var antiPhishing = require("../models/antiphising");
var polymarketDB = require("../models/polymarket");
var UserWallet = require("../models/userWallet");
var Prediction = require("../models/predictions");
var currencyDB = require("../models/currency");
const redis = require("../redis");
const cron = require("node-cron");
const { formatUnits } = require("ethers");
var TelegramGroup = require("../models/telegramGroup");
const mongoose = require("mongoose");
const userPublicWallet = require("../models/publicWallet");
const AdminWallet = require("../models/adminWallet");
const { Wallet } = require("ethers");
var usersDB = require("../models/users");
const jwt = require("jsonwebtoken");
var Event = require("../models/Events");
const crypto = require("crypto");
const { ethers } = require("ethers");
const nacl = require("tweetnacl");
const bs58Import = require("bs58");
const axios = require("axios");
const bs58 = bs58Import.default;
const Market = require("../models/markets");
var WithdrawDB = require("../models/withdraw");
var orderDB = require("../models/orderPlace");
var orderConfirmDB = require("../models/confirmOrder");
var mail = require("../utils/mailhelper");
var depositList = require("../models/depositList");
const AdminWalletHistory = require("../models/AdminWalletHistory");
const PlatformFeeSettings = require("../models/PlatformFeeSettings");
const Referral = require("../models/referral");
const useragent = require("useragent");
const key = require("../config/key");
const markets = require("../models/markets");
const web3 = require("@solana/web3.js");
const jwt_secret = key.JWT_TOKEN_SECRET;
const OTP = require("../models/otp");
const API_URL = process.env.POLYMARKET_URL;
const TelegramBot = require('node-telegram-bot-api');

const {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getMint,
  TOKEN_PROGRAM_ID,
  getAccount
} = require("@solana/spl-token");
const USDC_CONTRACT =
  "0xaf88d065e77c8cc2239327c5edb3a432268e5831";
const CHAIN_IDS = {
  ETH: 1,
  ARB: 42161,
  POLY: 137,
};
// const  Keypair = require("@solana/web3.js");
const {
  Keypair,
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
} = require("@solana/web3.js");
const userWallet = require("../models/userWallet");
const UserPublicWallet = require("../models/publicWallet");
const adminWallet = require("../models/adminWallet");
// const userWallet = require("../models/userWallet");

const privateKeyString = process.env.SOLFLARE_PRIVATE_KEY;

const ARB_RPC = "https://arb1.arbitrum.io/rpc";

const evmProvider = new ethers.JsonRpcProvider(ARB_RPC);

const USDC_ADDRESS = process.env.USDC_ADDRESS;

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address,uint256) returns (bool)",
  'function decimals() view returns (uint8)'
];

const PROVIDERS = {
  // ETH: new ethers.JsonRpcProvider("YOUR_ETH_RPC_URL"),
  ARB: new ethers.JsonRpcProvider(ARB_RPC),
  SOL: new Connection("https://api.mainnet-beta.solana.com", "confirmed"),
};

const CURRENCY_CONFIG = {
  // ETH: {
  //   symbol: "ETH",
  //   name: "Ethereum",
  //   image: "eth-icon.png",
  //   decimals: 18,
  // },
  ARB: {
    symbol: "ARB",
    name: "Arbitrum",
    image: "arb-icon.png",
    decimals: 18,
  },
  SOL: {
    symbol: "SOL",
    name: "Solana",
    image: "sol-icon.png",
    decimals: 9,
  },
};
function calculateBet(amount, odds) {
  const shares = amount / odds;
  const payout = shares;
  const profit = payout - amount;

  return {
    shares: Number(shares.toFixed(6)),
    payout: Number(payout.toFixed(2)),
    profit: Number(profit.toFixed(2)),
  };
}
  const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: false });

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
async function sendOTPViaTelegram(telegramId, code) {
  const message = `🔐 Your verification code is: *${code}*\n\nThis code will expire in 3 minutes.\n\nDo not share this code with anyone.`;

  try {
    await bot.sendMessage(telegramId, message, { 
      parse_mode: 'Markdown' 
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return { success: false, error: error.message };
  }
}

async function send_otp(data){
  try {
    const { telegramId } = data;

    if (!telegramId) {
      return res.status(400).json({
        status: false,
        message: 'Telegram ID is required'
      });
    }

    // Check if there's a recent unverified OTP (within last minute)
    const recentOTP = await OTP.findOne({
      telegramId,
      verified: false,
      createdAt: { $gte: new Date(Date.now() - 60000) } // 1 minute
    });

    if (recentOTP) {
      return ({
        status: false,
        message: 'Please wait before requesting a new code',
        retryAfter: 60
      });
    }

    // Generate OTP
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes

    // Delete old unverified OTPs for this user
    await OTP.deleteMany({ telegramId, verified: false });
    // Create new OTP
    const otp = new OTP({
      telegramId,
      code,
      expiresAt
    });

    await otp.save();

    // Send OTP via Telegram
    const sendResult = await sendOTPViaTelegram(telegramId, code);

    if (!sendResult.success) {
      return ({
        status: false,
        message: 'Failed to send OTP',
        error: sendResult.error
      });
    }

    return ({
      status: true,
      message: 'OTP sent successfully to your Telegram',
      expiresIn: 300 // seconds
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    return res.status(500).json({
      status: false,
      message: 'Error sending OTP',
      error: error.message
    });
  }
}

async function verify_otp(data){

   try {
    const { telegramId, code } = data;

    if (!telegramId || !code) {
      return {
        status: false,
        message: "Telegram ID and code are required"
      };
    }

    const otp = await OTP.findOne({
      telegramId,
      verified: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    if (!otp) {
      return {
        status: false,
        message: "OTP expired or not found"
      };
    }

    if (otp.attempts >= 5) {
      await OTP.deleteOne({ _id: otp._id });

      return {
        status: false,
        message: "Too many failed attempts"
      };
    }

    if (otp.code !== code) {
      await OTP.updateOne(
        { _id: otp._id },
        { $inc: { attempts: 1 } }
      );

      return {
        status: false,
        message: "Invalid verification code",
        attemptsLeft: 4 - otp.attempts
      };
    }

    await OTP.updateOne(
      { _id: otp._id },
      {
        $set: {
          verified: true
        }
      }
    );

    setImmediate(() => {
      bot.sendMessage(
        telegramId,
        "✅ Verification successful! Your account is now verified."
      ).catch(console.error);
    });

    return {
      status: true,
      verified: true,
      message: "Verification successful"
    };

  } catch (err) {
    console.error("Verify OTP error:", err);

    return {
      status: false,
      message: "Internal server error"
    };
  }
// try {
//     const { telegramId, code } = data;

//     if (!telegramId || !code) {
//       return ({
//         status: false,
//         message: 'Telegram ID and code are required'
//       });
//     }

//     // Find the OTP
//     const otp = await OTP.findOne({
//       telegramId,
//       verified: false
//     }).sort({ createdAt: -1 });

//     if (!otp) {
//       return ({
//         status: false,
//         message: 'No verification code found. Please request a new one.'
//       });
//     }

//     // Check if expired
//     if (new Date() > otp.expiresAt) {
//       await OTP.deleteOne({ _id: otp._id });
//       return ({
//         status: false,
//         message: 'Verification code has expired. Please request a new one.'
//       });
//     }

//     // Check max attempts (prevent brute force)
//     if (otp.attempts >= 5) {
//       await OTP.deleteOne({ _id: otp._id });
//       return ({
//         status: false,
//         message: 'Too many failed attempts. Please request a new code.'
//       });
//     }

//     // Verify code
//     if (otp.code !== code) {
//       otp.attempts += 1;
//       await otp.save();

//       return ({
//         status: false,
//         message: 'Invalid verification code',
//         attemptsLeft: 5 - otp.attempts
//       });
//     }

//     // Code is correct
//     otp.verified = true;
//     await otp.save();

//     // Send success message via Telegram
//     await bot.sendMessage(
//       telegramId,
//       '✅ Verification successful! Your account is now verified.',
//       { parse_mode: 'Markdown' }
//     );

//     return ({
//       status: true,
//       message: 'Verification successful',
//       verified: true
//     });

//   } catch (error) {
//     console.error('Verify OTP error:', error);
//     return ({
//       status: false,
//       message: 'Error verifying OTP',
//       error: error.message
//     });
//   }
}
async function resend_otp(data){
  try {
    const { telegramId } = data;

    if (!telegramId) {
      return {
        status: false,
        message: "Telegram ID is required"
      };
    }

    const code = generateOTP();

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // 🔥 ONE DB OPERATION
    await OTP.findOneAndUpdate(
      { telegramId, verified: false },
      {
        telegramId,
        code,
        expiresAt,
        attempts: 0,
        verified: false
      },
      {
        upsert: true,
        new: true
      }
    );

    // 🚀 Telegram async (NON-BLOCKING)
    setImmediate(() => {
      sendOTPViaTelegram(telegramId, code)
        .catch(console.error);
    });

    return {
      status: true,
      message: "OTP sent successfully",
      expiresIn: 300
    };

  } catch (err) {
    console.error("Resend OTP error:", err);

    return {
      status: false,
      message: "Internal server error"
    };
  }
  // try {
  //   const { telegramId } = data

  //   if (!telegramId) {
  //     return ({
  //       status: false,
  //       message: 'Telegram ID is required'
  //     });
  //   }

  //   // Delete old OTP
  //   await OTP.deleteMany({ telegramId, verified: false });

  //   // Generate new OTP
  //   const code = generateOTP();
  //   const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  //   const otp = new OTP({
  //     telegramId,
  //     code,
  //     expiresAt
  //   });

  //   await otp.save();

  //   // Send OTP
  //   const sendResult = await sendOTPViaTelegram(telegramId, code);

  //   if (!sendResult.success) {
  //     return ({
  //       status: false,
  //       message: 'Failed to resend OTP',
  //       error: sendResult.error
  //     });
  //   }

  //   return ({
  //     status: true,
  //     message: 'OTP resent successfully',
  //     expiresIn: 300
  //   });

  // } catch (error) {
  //   console.error('Resend OTP error:', error);
  //   return ({
  //     status: false,
  //     message: 'Error resending OTP',
  //     error: error.message
  //   });
  // }
}

async function getCryptoPriceInUSDT(symbol) {
  try {
    if (!symbol) return 0;
    if (symbol.toUpperCase() === "USDT") return 1;

    const pair = `${symbol.toUpperCase()}USDT`;
    const { data } = await axios.get(
      `https://api.binance.com/api/v3/ticker/price?symbol=${pair}`,
    );

    return Number(data.price) || 0;
  } catch (error) {
    console.error("Binance price error:", symbol, error.message);
    return 0;
  }
}

// async function getMergedMarketsHandler(data) {
//   try {
//     const limit = 50;

//     await Market.updateMany(
//       { endDate: { $lt: new Date() }, active: true },
//       { $set: { active: false } }
//     );

//     await polymarketDB.updateMany(
//       { endDate: { $lt: new Date() }, active: true },
//       { $set: { active: false } }
//     );

//     const manualMarkets = await Market.find({
//       active: true,
//       endDate: { $gte: new Date() }
//     })
//       .sort({ createdAt: -1 })
//       .limit(limit)
//       .lean();

//     const taggedManualMarkets = manualMarkets.map((item) => ({
//       ...item,
//       source: "manual",
//     }));

//     const manualCount = taggedManualMarkets.length;
//     const remaining = limit - manualCount;

//     let polymarkets = [];
//     if (remaining > 0) {
//       polymarkets = await polymarketDB
//         .find({
//           active: true,
//           closed: false,
//           endDate: { $gte: new Date() }
//         })
//         .sort({ createdAt: -1 })
//         .limit(remaining)
//         .lean();
//     }

//     const polymarketWithChance = polymarkets.map((item) => {
//       let outcomes = item.outcomes;
//       if (Array.isArray(outcomes) && typeof outcomes[0] === "string") {
//         try { outcomes = JSON.parse(outcomes[0]); } catch {}
//       }

//       let outcomePrices = item.outcomePrices;
//       if (Array.isArray(outcomePrices) && typeof outcomePrices[0] === "string") {
//         try { outcomePrices = JSON.parse(outcomePrices[0]); } catch {}
//       }

//       let chancePercents = null;
//       if (Array.isArray(outcomePrices) && outcomePrices.length >= 2) {
//         chancePercents = outcomePrices.map((p) => Number((Number(p) * 100).toFixed(2)));
//       } else if (
//         typeof item.yesPool === "number" &&
//         typeof item.noPool === "number" &&
//         item.yesPool + item.noPool > 0
//       ) {
//         const total = item.yesPool + item.noPool;
//         chancePercents = [
//           Number(((item.yesPool / total) * 100).toFixed(2)),
//           Number(((item.noPool / total) * 100).toFixed(2)),
//         ];
//       } else {
//         chancePercents = [50, 50];
//       }

//       return {
//         ...item,
//         outcomes,
//         outcomePrices,
//         chancePercents,
//         source: "poly",
//       };
//     });

//     const merged = [...taggedManualMarkets, ...polymarketWithChance];

//     const keysToKeep = [
//       "_id","question","description","tags","image","startDate","conditionId",
//       "endDate","liquidity","minimumLiquidity","estimatedNetworkFee",
//       "totalLiquidity","totalDeduction","outcomes","outcomePrices","chancePercents",
//       "bestBid","bestAsk","resolution","currency","active","category","closed",
//       "archived","slug","specifyId","acceptingOrders","events","source",
//     ];

//     const finalData = merged.map((item) => {
//       const filtered = {};
//       keysToKeep.forEach((k) => { if(item[k] !== undefined) filtered[k] = item[k]; });
//       return filtered;
//     });

//     return { success: true, data: finalData };
//   } catch (error) {
//     console.error("Error merging markets:", error);
//     return { success: false, data: [], error: error.message };
//   }
// }

// async function getMergedMarketsHandler(data) {
//   try {
//     const limit = Number(data?.limit) || 10;
//     const cursor = data?.cursor ? new Date(data.cursor) : null;
//     const category = data?.category || null;

//     const cursorQuery = cursor ? { createdAt: { $lt: cursor } } : {};

//     let categoryQuery = {};
//     let manualOnly = false;

//     if (category === "Manual") {
//       manualOnly = true;
//     } else if (category) {
//       categoryQuery = { category };
//     }

//     await Market.updateMany(
//       { endDate: { $lt: new Date() }, active: true },
//       { $set: { active: false } },
//     );

//     await polymarketDB.updateMany(
//       { endDate: { $lt: new Date() }, active: true },
//       { $set: { active: false } },
//     );

//     const manualMarkets = await Market.find({
//       active: true,
//       endDate: { $gte: new Date() },
//       ...cursorQuery,
//       ...(manualOnly ? {} : categoryQuery),
//     })
//       .sort({ createdAt: -1 })
//       .limit(limit)
//       .lean();

//     const taggedManualMarkets = manualMarkets.map((item) => ({
//       ...item,
//       source: "manual",
//       closed: false,
//     }));

//     const manualCount = taggedManualMarkets.length;
//     const remaining = limit - manualCount;

//     let polymarkets = [];
//     if (!manualOnly && remaining > 0) {
//       polymarkets = await polymarketDB
//         .find({
//           active: true,
//           closed: false,
//           endDate: { $gte: new Date() },
//           ...cursorQuery,
//           ...categoryQuery,
//         })
//         .sort({ createdAt: -1 })
//         .limit(remaining)
//         .lean();
//     }

//     const polymarketWithChance = polymarkets.map((item) => {
//       let outcomes = item.outcomes;
//       if (Array.isArray(outcomes) && typeof outcomes[0] === "string") {
//         try {
//           outcomes = JSON.parse(outcomes[0]);
//         } catch {}
//       }

//       let outcomePrices = item.outcomePrices;
//       if (
//         Array.isArray(outcomePrices) &&
//         typeof outcomePrices[0] === "string"
//       ) {
//         try {
//           outcomePrices = JSON.parse(outcomePrices[0]);
//         } catch {}
//       }

//       let chancePercents = null;
//       if (Array.isArray(outcomePrices) && outcomePrices.length >= 2) {
//         chancePercents = outcomePrices.map((p) =>
//           Number((Number(p) * 100).toFixed(2)),
//         );
//       } else if (
//         typeof item.yesPool === "number" &&
//         typeof item.noPool === "number" &&
//         item.yesPool + item.noPool > 0
//       ) {
//         const total = item.yesPool + item.noPool;
//         chancePercents = [
//           Number(((item.yesPool / total) * 100).toFixed(2)),
//           Number(((item.noPool / total) * 100).toFixed(2)),
//         ];
//       } else {
//         chancePercents = [50, 50];
//       }

//       return {
//         ...item,
//         outcomes,
//         outcomePrices,
//         chancePercents,
//         source: "poly",
//       };
//     });

//     const mergedTemp = [...taggedManualMarkets, ...polymarketWithChance];

//     const nonOtherMarkets = mergedTemp.filter(
//       (item) => item.category !== "Other",
//     );

//     const otherMarkets = mergedTemp.filter((item) => item.category === "Other");

//     const merged = [...nonOtherMarkets, ...otherMarkets];

//     const keysToKeep = [
//       "_id",
//       "question",
//       "description",
//       "tags",
//       "image",
//       "startDate",
//       "conditionId",
//       "endDate",
//       "liquidity",
//       "minimumLiquidity",
//       "estimatedNetworkFee",
//       "totalLiquidity",
//       "totalDeduction",
//       "outcomes",
//       "outcomePrices",
//       "chancePercents",
//       "bestBid",
//       "bestAsk",
//       "resolution",
//       "currency",
//       "active",
//       "category",
//       "closed",
//       "archived",
//       "slug",
//       "specifyId",
//       "acceptingOrders",
//       "events",
//       "source",
//       "createdAt",
//     ];

//     const finalData = merged.map((item) => {
//       const filtered = {};
//       keysToKeep.forEach((k) => {
//         if (item[k] !== undefined) filtered[k] = item[k];
//       });
//       return filtered;
//     });

//     const nextCursor =
//       finalData.length > 0 ? finalData[finalData.length - 1].createdAt : null;

//     return {
//       success: true,
//       data: finalData,
//       nextCursor,
//       hasMore: finalData.length === limit,
//     };
//   } catch (error) {
//     console.error("Error merging markets:", error);
//     return { success: false, data: [], error: error.message };
//   }
// }


// async function getMergedMarketsHandler(data) {
//   try {
//     const limit = Number(data?.limit) || 10;
//     const cursor = data?.cursor ? new Date(data.cursor) : null;
//     const category = data?.category || null;

//     const cursorQuery = cursor ? { startDate: { $lt: cursor } } : {};

//     let categoryQuery = {};
//     let manualOnly = false;
//     let polyOnly = false;
//     let timeFilter = null;

//     let sortQuery = { startDate: -1 };

//     if (category === "Manual") {
//       manualOnly = true;
//     }

//     if (category === "Trending") {
//       polyOnly = true;
//       sortQuery = { liquidity: -1, volume24hr: -1 };
//     }

//     if (category === "15mins") {
//       timeFilter = new Date(Date.now() - 15 * 60 * 1000);
//     }

//     if (category === "4hrs") {
//       timeFilter = new Date(Date.now() - 4 * 60 * 60 * 1000);
//     }

//     if (category === "24hrs") {
//       timeFilter = new Date(Date.now() - 24 * 60 * 60 * 1000);
//     }

//     if (
//       category &&
//       !["Manual", "Trending", "15mins", "4hrs", "24hrs"].includes(category)
//     ) {
//       categoryQuery = { category };
//     }

//     await Market.updateMany(
//       { endDate: { $lt: new Date() }, active: true },
//       { $set: { active: false } },
//     );

//     await polymarketDB.updateMany(
//       { endDate: { $lt: new Date() }, active: true },
//       { $set: { active: false } },
//     );

//     let taggedManualMarkets = [];

//     if (!polyOnly) {
//       const manualQuery = {
//         active: true,
//         endDate: { $gte: new Date() },
//         ...cursorQuery,
//         ...(manualOnly ? {} : categoryQuery),
//       };

//       if (timeFilter) {
//         manualQuery.startDate = { $gte: timeFilter };
//       }

//       const manualMarkets = await Market.find(manualQuery)
//         .sort({ startDate: -1 })   
//         .limit(limit)
//         .lean();

//       taggedManualMarkets = manualMarkets.map((item) => ({
//         ...item,
//         source: "manual",
//         closed: false,
//       }));
//     }

//     const manualCount = taggedManualMarkets.length;
//     const remaining = limit - manualCount;

//     let polymarkets = [];

//     if ((!manualOnly || polyOnly) && remaining > 0) {
//       const polyQuery = {
//         active: true,
//         closed: false,
//         endDate: { $gte: new Date() },
//         ...cursorQuery,
//         ...(polyOnly ? {} : categoryQuery),
//       };

//       if (timeFilter) {
//         polyQuery.startDate = { $gte: timeFilter };
//       }

//       polymarkets = await polymarketDB
//         .find(polyQuery)
//         .sort(sortQuery)  
//         .limit(remaining)
//         .lean();
//     }

//     const polymarketWithChance = polymarkets.map((item) => {
//       let outcomes = item.outcomes;
//       if (Array.isArray(outcomes) && typeof outcomes[0] === "string") {
//         try { outcomes = JSON.parse(outcomes[0]); } catch {}
//       }

//       let outcomePrices = item.outcomePrices;
//       if (Array.isArray(outcomePrices) && typeof outcomePrices[0] === "string") {
//         try { outcomePrices = JSON.parse(outcomePrices[0]); } catch {}
//       }

//       let chancePercents = null;

//       if (Array.isArray(outcomePrices) && outcomePrices.length >= 2) {
//         chancePercents = outcomePrices.map((p) =>
//           Number((Number(p) * 100).toFixed(2))
//         );
//       } else if (
//         typeof item.yesPool === "number" &&
//         typeof item.noPool === "number" &&
//         item.yesPool + item.noPool > 0
//       ) {
//         const total = item.yesPool + item.noPool;
//         chancePercents = [
//           Number(((item.yesPool / total) * 100).toFixed(2)),
//           Number(((item.noPool / total) * 100).toFixed(2)),
//         ];
//       } else {
//         chancePercents = [50, 50];
//       }

//       return {
//         ...item,
//         outcomes,
//         outcomePrices,
//         chancePercents,
//         source: "poly",
//       };
//     });

//     // ---------- MERGE ----------
//     const mergedTemp = [...taggedManualMarkets, ...polymarketWithChance];

//     const nonOtherMarkets = mergedTemp.filter(
//       (item) => item.category !== "Other"
//     );

//     const otherMarkets = mergedTemp.filter(
//       (item) => item.category === "Other"
//     );

//     const merged = [...nonOtherMarkets, ...otherMarkets];

//     const keysToKeep = [
//       "_id",
//       "question",
//       "description",
//       "tags",
//       "image",
//       "startDate",
//       "conditionId",
//       "endDate",
//       "liquidity",
//       "volume24hr",
//       "minimumLiquidity",
//       "estimatedNetworkFee",
//       "totalLiquidity",
//       "totalDeduction",
//       "outcomes",
//       "outcomePrices",
//       "chancePercents",
//       "bestBid",
//       "bestAsk",
//       "resolution",
//       "currency",
//       "active",
//       "category",
//       "closed",
//       "archived",
//       "slug",
//       "specifyId",
//       "acceptingOrders",
//       "events",
//       "source",
//       "createdAt",
//     ];

//     const finalData = merged.map((item) => {
//       const filtered = {};
//       keysToKeep.forEach((k) => {
//         if (item[k] !== undefined) filtered[k] = item[k];
//       });
//       return filtered;
//     });

//     const nextCursor =
//       finalData.length > 0
//         ? finalData[finalData.length - 1].startDate
//         : null;

//     return {
//       success: true,
//       data: finalData,
//       nextCursor,
//       hasMore: finalData.length === limit,
//     };
//   } catch (error) {
//     console.error("Error merging markets:", error);
//     return { success: false, data: [], error: error.message };
//   }
// }



// async function getMergedMarketsHandler(data) {
//   try {
//     const limit = Number(data?.limit) || 10;
//     const cursor = data?.cursor ? new Date(data.cursor) : null;
//     const category = data?.category || null;
//     const subcategory = data?.subcategory || null;
//     const search = data?.search || null;

//     const cursorQuery = cursor ? { startDate: { $lt: cursor } } : {};

//     let categoryQuery = {};
//     let subcategoryQuery = {};   
//     let manualOnly = false;
//     let polyOnly = false;
//     let timeFilter = null;

//     let searchQuery = {};

//     let sortQuery = { startDate: -1 };

//     if (category === "Manual") {
//       manualOnly = true;
//     }

//     if (category === "Trending") {
//       polyOnly = true;
//       sortQuery = { liquidity: -1, volume24hr: -1 };
//     }

//     if (category === "15mins") {
//       timeFilter = new Date(Date.now() - 15 * 60 * 1000);
//     }

//     if (category === "4hrs") {
//       timeFilter = new Date(Date.now() - 4 * 60 * 60 * 1000);
//     }

//     if (category === "24hrs") {
//       timeFilter = new Date(Date.now() - 24 * 60 * 60 * 1000);
//     }

//     if (
//       category &&
//       !["Manual", "Trending", "15mins", "4hrs", "24hrs"].includes(category)
//     ) {
//       categoryQuery = { category };
//     }

//     if (subcategory && subcategory !== "All") {
//       subcategoryQuery = { subcategory };
//     }

//     if (search && search.trim()) {
//       const regex = new RegExp(search.trim(), "i");
//       searchQuery = {
//         $or: [
//           { question: regex },
//           { description: regex },
//           { tags: regex },
//           { slug: regex },
//         ],
//       };
//     }

//     await Market.updateMany(
//       { endDate: { $lt: new Date() }, active: true },
//       { $set: { active: false } },
//     );

//     await polymarketDB.updateMany(
//       { endDate: { $lt: new Date() }, active: true },
//       { $set: { active: false } },
//     );

//     let taggedManualMarkets = [];

//     if (!polyOnly) {
//       const manualQuery = {
//         active: true,
//         endDate: { $gte: new Date() },
//         ...cursorQuery,
//         ...(manualOnly ? {} : categoryQuery),
//         ...subcategoryQuery,
//         ...searchQuery,
//       };

//       if (timeFilter) {
//         manualQuery.startDate = { $gte: timeFilter };
//       }

//       const manualMarkets = await Market.find(manualQuery)
//         .sort({ startDate: -1 })   
//         .limit(limit)
//         .lean();

//       taggedManualMarkets = manualMarkets.map((item) => ({
//         ...item,
//         source: "manual",
//         closed: false,
//       }));
//     }

//     const manualCount = taggedManualMarkets.length;
//     const remaining = limit - manualCount;

//     let polymarkets = [];

//     if ((!manualOnly || polyOnly) && remaining > 0) {
//       const polyQuery = {
//         active: true,
//         closed: false,
//         endDate: { $gte: new Date() },
//         ...cursorQuery,
//         ...(polyOnly ? {} : categoryQuery),
//         ...subcategoryQuery,
//         ...searchQuery,
//       };

//       if (timeFilter) {
//         polyQuery.startDate = { $gte: timeFilter };
//       }

//       polymarkets = await polymarketDB
//         .find(polyQuery)
//         .sort(sortQuery)  
//         .limit(remaining)
//         .lean();
//     }

//     const polymarketWithChance = polymarkets.map((item) => {
//       let outcomes = item.outcomes;
//       if (Array.isArray(outcomes) && typeof outcomes[0] === "string") {
//         try { outcomes = JSON.parse(outcomes[0]); } catch {}
//       }

//       let outcomePrices = item.outcomePrices;
//       if (Array.isArray(outcomePrices) && typeof outcomePrices[0] === "string") {
//         try { outcomePrices = JSON.parse(outcomePrices[0]); } catch {}
//       }

//       let chancePercents = null;

//       if (Array.isArray(outcomePrices) && outcomePrices.length >= 2) {
//         chancePercents = outcomePrices.map((p) =>
//           Number((Number(p) * 100).toFixed(2))
//         );
//       } else if (
//         typeof item.yesPool === "number" &&
//         typeof item.noPool === "number" &&
//         item.yesPool + item.noPool > 0
//       ) {
//         const total = item.yesPool + item.noPool;
//         chancePercents = [
//           Number(((item.yesPool / total) * 100).toFixed(2)),
//           Number(((item.noPool / total) * 100).toFixed(2)),
//         ];
//       } else {
//         chancePercents = [50, 50];
//       }

//       return {
//         ...item,
//         outcomes,
//         outcomePrices,
//         chancePercents,
//         source: "poly",
//       };
//     });

//     const mergedTemp = [...taggedManualMarkets, ...polymarketWithChance];

//     const nonOtherMarkets = mergedTemp.filter(
//       (item) => item.category !== "Other"
//     );

//     const otherMarkets = mergedTemp.filter(
//       (item) => item.category === "Other"
//     );

//     const merged = [...nonOtherMarkets, ...otherMarkets];

//     const keysToKeep = [
//       "_id",
//       "question",
//       "description",
//       "tags",
//       "image",
//       "startDate",
//       "conditionId",
//       "endDate",
//       "liquidity",
//       "volume24hr",
//       "minimumLiquidity",
//       "estimatedNetworkFee",
//       "totalLiquidity",
//       "totalDeduction",
//       "outcomes",
//       "outcomePrices",
//       "chancePercents",
//       "bestBid",
//       "bestAsk",
//       "resolution",
//       "currency",
//       "active",
//       "category",
//       "closed",
//       "archived",
//       "slug",
//       "specifyId",
//       "acceptingOrders",
//       "events",
//       "source",
//       "createdAt",
//     ];

//     const finalData = merged.map((item) => {
//       const filtered = {};
//       keysToKeep.forEach((k) => {
//         if (item[k] !== undefined) filtered[k] = item[k];
//       });
//       return filtered;
//     });

//     const nextCursor =
//       finalData.length > 0
//         ? finalData[finalData.length - 1].startDate
//         : null;

//     return {
//       success: true,
//       data: finalData,
//       nextCursor,
//       hasMore: finalData.length === limit,
//     };
//   } catch (error) {
//     console.error("Error merging markets:", error);
//     return { success: false, data: [], error: error.message };
//   }
// }


// async function getMergedMarketsHandler(data) {
//   try {
//     const limit = Number(data?.limit) || 10;

//     const cursor =
//       data?.cursor && !isNaN(new Date(data.cursor))
//         ? new Date(data.cursor)
//         : null;

//     const category = data?.category || null;
//     const subcategory = data?.subcategory || null;
//     const search = data?.search || null;

//     const cursorQuery = cursor ? { startDate: { $lt: cursor } } : {};

//     let categoryQuery = {};
//     let subcategoryQuery = {};
//     let newQuery = {};             
//     let manualOnly = false;
//     let polyOnly = false;
//     let timeFilter = null;
//     let searchQuery = {};

//     let sortQuery = { startDate: -1 };

//     if (category === "Manual") {
//       manualOnly = true;
//     }

//     if (category === "Trending") {
//       polyOnly = true;
//       sortQuery = { liquidity: -1, volume24hr: -1 };
//     }

//     if (category === "New") {
//       newQuery = { new: true };
//     }

//     if (category === "15mins") {
//       timeFilter = new Date(Date.now() - 15 * 60 * 1000);
//     }

//     if (category === "4hrs") {
//       timeFilter = new Date(Date.now() - 4 * 60 * 60 * 1000);
//     }

//     if (category === "24hrs") {
//       timeFilter = new Date(Date.now() - 24 * 60 * 60 * 1000);
//     }

//     if (
//       category &&
//       !["Manual", "Trending", "New", "15mins", "4hrs", "24hrs"].includes(category)
//     ) {
//       categoryQuery = { category };
//     }

//     if (subcategory && subcategory !== "All") {
//       subcategoryQuery = { subcategory };
//     }

//     if (search && search.trim()) {
//       const regex = new RegExp(search.trim(), "i");
//       searchQuery = {
//         $or: [
//           { question: regex },
//           { description: regex },
//           { tags: regex },
//           { slug: regex },
//         ],
//       };
//     }

//     await Market.updateMany(
//       { endDate: { $lt: new Date() }, active: true },
//       { $set: { active: false } }
//     );

//     await polymarketDB.updateMany(
//       { endDate: { $lt: new Date() }, active: true },
//       { $set: { active: false } }
//     );

//     let taggedManualMarkets = [];

//     if (!polyOnly) {
//       const manualQuery = {
//         active: true,
//         endDate: { $gte: new Date() },
//         ...cursorQuery,
//         ...(manualOnly ? {} : categoryQuery),
//         ...subcategoryQuery,
//         ...newQuery,          
//         ...searchQuery,
//       };

//       if (timeFilter) {
//         manualQuery.startDate = { $gte: timeFilter };
//       }

//       const manualMarkets = await Market.find(manualQuery)
//         .sort(sortQuery)
//         .limit(limit)
//         .lean();

//       taggedManualMarkets = manualMarkets.map((item) => ({
//         ...item,
//         source: "manual",
//         closed: false,
//       }));
//     }

//     const manualCount = taggedManualMarkets.length;
//     const remaining = limit - manualCount;

//     let polymarkets = [];

//     if ((!manualOnly || polyOnly) && remaining > 0) {
//       const polyQuery = {
//         active: true,
//         closed: false,
//         endDate: { $gte: new Date() },
//         ...cursorQuery,
//         ...(polyOnly ? {} : categoryQuery),
//         ...subcategoryQuery,
//         ...newQuery,       
//         ...searchQuery,
//       };

//       if (timeFilter) {
//         polyQuery.startDate = { $gte: timeFilter };
//       }

//       polymarkets = await polymarketDB
//         .find(polyQuery)
//         .sort(sortQuery)
//         .limit(remaining)
//         .lean();
//     }

//     const polymarketWithChance = polymarkets.map((item) => {
//       let outcomes = item.outcomes;
//       if (Array.isArray(outcomes) && typeof outcomes[0] === "string") {
//         try { outcomes = JSON.parse(outcomes[0]); } catch {}
//       }

//       let outcomePrices = item.outcomePrices;
//       if (Array.isArray(outcomePrices) && typeof outcomePrices[0] === "string") {
//         try { outcomePrices = JSON.parse(outcomePrices[0]); } catch {}
//       }

//       let chancePercents = null;

//       if (Array.isArray(outcomePrices) && outcomePrices.length >= 2) {
//         chancePercents = outcomePrices.map((p) =>
//           Number((Number(p) * 100).toFixed(2))
//         );
//       } else if (
//         typeof item.yesPool === "number" &&
//         typeof item.noPool === "number" &&
//         item.yesPool + item.noPool > 0
//       ) {
//         const total = item.yesPool + item.noPool;
//         chancePercents = [
//           Number(((item.yesPool / total) * 100).toFixed(2)),
//           Number(((item.noPool / total) * 100).toFixed(2)),
//         ];
//       } else {
//         chancePercents = [50, 50];
//       }

//       return {
//         ...item,
//         outcomes,
//         outcomePrices,
//         chancePercents,
//         source: "poly",
//       };
//     });

//     const mergedTemp = [...taggedManualMarkets, ...polymarketWithChance];

//     const nonOtherMarkets = mergedTemp.filter(
//       (item) => item.category !== "Other"
//     );

//     const otherMarkets = mergedTemp.filter(
//       (item) => item.category === "Other"
//     );

//     const merged = [...nonOtherMarkets, ...otherMarkets];

//     const keysToKeep = [
//       "_id",
//       "question",
//       "description",
//       "tags",
//       "image",
//       "startDate",
//       "conditionId",
//       "endDate",
//       "liquidity",
//       "volume24hr",
//       "minimumLiquidity",
//       "estimatedNetworkFee",
//       "totalLiquidity",
//       "totalDeduction",
//       "outcomes",
//       "outcomePrices",
//       "chancePercents",
//       "bestBid",
//       "bestAsk",
//       "resolution",
//       "currency",
//       "active",
//       "category",
//       "closed",
//       "archived",
//       "slug",
//       "specifyId",
//       "acceptingOrders",
//       "events",
//       "source",
//       "createdAt",
//     ];

//     const finalData = merged.map((item) => {
//       const filtered = {};
//       keysToKeep.forEach((k) => {
//         if (item[k] !== undefined) filtered[k] = item[k];
//       });
//       return filtered;
//     });

//     const nextCursor =
//       finalData.length > 0
//         ? finalData[finalData.length - 1].startDate
//         : null;

//     return {
//       success: true,
//       data: finalData,
//       nextCursor,
//       hasMore: finalData.length === limit,
//     };
//   } catch (error) {
//     console.error("Error merging markets:", error);
//     return { success: false, data: [], error: error.message };
//   }
// }


async function getMergedMarketsHandler(data) {
  try {
    const limit = Number(data?.limit) || 10;

    const cursor =
      data?.cursor && !isNaN(new Date(data.cursor))
        ? new Date(data.cursor)
        : null;

    const category = data?.category || null;
    const subcategory = data?.subcategory || null;
    const search = data?.search || null;

    const cursorQuery = cursor ? { startDate: { $lt: cursor } } : {};

    const telegramId = data?.telegramId || null;

    let categoryQuery = {};
    let subcategoryQuery = {};
    let newQuery = {};
    let manualOnly = false;
    let polyOnly = false;
    let timeFilter = null;
    let searchQuery = {};

    let sortQuery = { startDate: -1 };

    if (category === "Manual") {
      manualOnly = true;
    }

    if (category === "Trending") {
      polyOnly = true;
      sortQuery = { liquidity: -1, volume24hr: -1 };
    }

    if (category === "New") {
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

      newQuery = {
        $or: [
          { new: true },
          { newMarketdate: { $gte: last24Hours } }
        ]
      };
    }

    if (category === "15mins") {
      timeFilter = new Date(Date.now() - 15 * 60 * 1000);
    }

    if (category === "4hrs") {
      timeFilter = new Date(Date.now() - 4 * 60 * 60 * 1000);
    }

    if (category === "24hrs") {
      timeFilter = new Date(Date.now() - 24 * 60 * 60 * 1000);
    }

    if (
      category &&
      !["Manual", "Trending", "New", "15mins", "4hrs", "24hrs"].includes(category)
    ) {
      categoryQuery = { category };
    }

    if (subcategory && subcategory !== "All") {
      subcategoryQuery = { subcategory };
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      searchQuery = { question: regex };
    }

    await Market.updateMany(
      { endDate: { $lt: new Date() }, active: true },
      { $set: { active: false } }
    );

    await polymarketDB.updateMany(
      { endDate: { $lt: new Date() }, active: true },
      { $set: { active: false } }
    );

    let taggedManualMarkets = [];

    if (!polyOnly) {
      const privateFilter = telegramId
        ? { $or: [{ isPrivate: { $ne: true } }, { allowedTelegramIds: telegramId }] }
        : { isPrivate: { $ne: true } };

      const manualQuery = {
        active: true,
        endDate: { $gte: new Date() },
        ...privateFilter,
        ...cursorQuery,
        ...(manualOnly ? {} : categoryQuery),
        ...subcategoryQuery,
        ...newQuery,
        ...searchQuery,
      };

      if (timeFilter) {
        manualQuery.startDate = { $gte: timeFilter };
      }

      const manualMarkets = await Market.find(manualQuery)
        .sort(sortQuery)
        .limit(limit)
        .lean();

      taggedManualMarkets = manualMarkets.map((item) => ({
        ...item,
        source: "manual",
        closed: false,
      }));
    }

    const manualCount = taggedManualMarkets.length;
    const remaining = limit - manualCount;

    let polymarkets = [];

    if ((!manualOnly || polyOnly) && remaining > 0) {
      const polyQuery = {
        active: true,
        closed: false,
        endDate: { $gte: new Date() },
        ...cursorQuery,
        ...(polyOnly ? {} : categoryQuery),
        ...subcategoryQuery,
        ...newQuery,
        ...searchQuery,
      };

      if (timeFilter) {
        polyQuery.startDate = { $gte: timeFilter };
      }

      polymarkets = await polymarketDB
        .find(polyQuery)
        .sort(sortQuery)
        .limit(remaining)
        .lean();
    }

    const polymarketWithChance = polymarkets.map((item) => {
      let outcomes = item.outcomes;
      if (Array.isArray(outcomes) && typeof outcomes[0] === "string") {
        try { outcomes = JSON.parse(outcomes[0]); } catch {}
      }

      let outcomePrices = item.outcomePrices;
      if (Array.isArray(outcomePrices) && typeof outcomePrices[0] === "string") {
        try { outcomePrices = JSON.parse(outcomePrices[0]); } catch {}
      }

      let chancePercents = null;

      if (Array.isArray(outcomePrices) && outcomePrices.length >= 2) {
        chancePercents = outcomePrices.map((p) =>
          Number((Number(p) * 100).toFixed(2))
        );
      } else if (
        typeof item.yesPool === "number" &&
        typeof item.noPool === "number" &&
        item.yesPool + item.noPool > 0
      ) {
        const total = item.yesPool + item.noPool;
        chancePercents = [
          Number(((item.yesPool / total) * 100).toFixed(2)),
          Number(((item.noPool / total) * 100).toFixed(2)),
        ];
      } else {
        chancePercents = [50, 50];
      }

      return {
        ...item,
        outcomes,
        outcomePrices,
        chancePercents,
        source: "poly",
      };
    });

    const mergedTemp = [...taggedManualMarkets, ...polymarketWithChance];

    const nonOtherMarkets = mergedTemp.filter(
      (item) => item.category !== "Other"
    );

    const otherMarkets = mergedTemp.filter(
      (item) => item.category === "Other"
    );

    const merged = [...nonOtherMarkets, ...otherMarkets];

    const keysToKeep = [
      "_id",
      "question",
      "description",
      "tags",
      "image",
      "startDate",
      "conditionId",
      "endDate",
      "liquidity",
      "volume24hr",
      "minimumLiquidity",
      "estimatedNetworkFee",
      "totalLiquidity",
      "totalDeduction",
      "outcomes",
      "outcomePrices",
      "chancePercents",
      "bestBid",
      "bestAsk",
      "resolution",
      "currency",
      "active",
      "category",
      "closed",
      "archived",
      "slug",
      "specifyId",
      "acceptingOrders",
      "events",
      "source",
      "createdAt",
    ];

    const finalData = merged.map((item) => {
      const filtered = {};
      keysToKeep.forEach((k) => {
        if (item[k] !== undefined) filtered[k] = item[k];
      });
      return filtered;
    });

    const nextCursor =
      finalData.length > 0
        ? finalData[finalData.length - 1].startDate
        : null;

    return {
      success: true,
      data: finalData,
      nextCursor,
      hasMore: finalData.length === limit,
    };
  } catch (error) {
    console.error("Error merging markets:", error);
    return { success: false, data: [], error: error.message };
  }
}



async function getMergedMarketByIdHandler(data) {
  try {
    const id = data?.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return { success: false, message: "Invalid market id" };
    }

    const objectId = new mongoose.Types.ObjectId(id);

    await Market.updateMany(
      { endDate: { $lt: new Date() }, active: true },
      { $set: { active: false } },
    );

    await polymarketDB.updateMany(
      { endDate: { $lt: new Date() }, active: true },
      { $set: { active: false } },
    );

    let market = await Market.findOne({
      _id: objectId,
      active: true,
      endDate: { $gte: new Date() },
    }).lean();

    if (market) {
      return {
        success: true,
        data: {
          _id: market._id,
          question: market.question,
          description: market.description,
          tags: market.tags,
          image: market.image,
          startDate: market.startDate,
          conditionId: market.conditionId,
          endDate: market.endDate,
          liquidity: market.liquidity,
          minimumLiquidity: market.minimumLiquidity,
          estimatedNetworkFee: market.estimatedNetworkFee,
          totalLiquidity: market.totalLiquidity,
          totalDeduction: market.totalDeduction,
          outcomes: market.outcomes,
          outcomePrices: market.outcomePrices,
          chancePercents: market.chancePercents,
          bestBid: market.bestBid,
          bestAsk: market.bestAsk,
          resolution: market.resolution,
          currency: market.currency,
          active: market.active,
          category: market.category,
          closed: false,
          archived: market.archived,
          slug: market.slug,
          specifyId: market.specifyId,
          acceptingOrders: market.acceptingOrders,
          events: market.events,
          source: "manual",
          createdAt: market.createdAt,
        },
      };
    }

    market = await polymarketDB
      .findOne({
        _id: objectId,
        active: true,
        closed: false,
        endDate: { $gte: new Date() },
      })
      .lean();

    if (!market) {
      return { success: false, message: "Market not found" };
    }

    let outcomes = market.outcomes;
    if (Array.isArray(outcomes) && typeof outcomes[0] === "string") {
      try {
        outcomes = JSON.parse(outcomes[0]);
      } catch {}
    }

    let outcomePrices = market.outcomePrices;
    if (Array.isArray(outcomePrices) && typeof outcomePrices[0] === "string") {
      try {
        outcomePrices = JSON.parse(outcomePrices[0]);
      } catch {}
    }

    let chancePercents;
    if (Array.isArray(outcomePrices) && outcomePrices.length >= 2) {
      chancePercents = outcomePrices.map((p) =>
        Number((Number(p) * 100).toFixed(2)),
      );
    } else if (
      typeof market.yesPool === "number" &&
      typeof market.noPool === "number" &&
      market.yesPool + market.noPool > 0
    ) {
      const total = market.yesPool + market.noPool;
      chancePercents = [
        Number(((market.yesPool / total) * 100).toFixed(2)),
        Number(((market.noPool / total) * 100).toFixed(2)),
      ];
    } else {
      chancePercents = [50, 50];
    }

    return {
      success: true,
      data: {
        _id: market._id,
        question: market.question,
        description: market.description,
        tags: market.tags,
        image: market.image,
        startDate: market.startDate,
        conditionId: market.conditionId,
        endDate: market.endDate,
        liquidity: market.liquidity,
        outcomeTokenIds: market.outcomeTokenIds,
        minimumLiquidity: market.minimumLiquidity,
        estimatedNetworkFee: market.estimatedNetworkFee,
        totalLiquidity: market.totalLiquidity,
        totalDeduction: market.totalDeduction,
        outcomes,
        outcomePrices,
        chancePercents,
        bestBid: market.bestBid,
        bestAsk: market.bestAsk,
        resolution: market.resolution,
        currency: market.currency,
        active: market.active,
        category: market.category,
        closed: market.closed,
        archived: market.archived,
        slug: market.slug,
        specifyId: market.specifyId,
        acceptingOrders: market.acceptingOrders,
        events: market.events,
        source: "poly",
        createdAt: market.createdAt,
      },
    };
  } catch (error) {
    console.error("Error fetching merged market by id:", error);
    return { success: false, data: null, error: error.message };
  }
}

function verifyTelegramWebApp(initData) {
  const params = new URLSearchParams(initData);

  const hash = params.get("hash");
  if (!hash) return false;

  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(process.env.BOT_TOKEN)
    .digest();

  const calculatedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  return calculatedHash === hash;
}

async function verifyTelegramWebAppHandler(data) {
  try {
    const { initData } = data;

    if (!initData) {
      return {
        success: false,
        code: 400,
        message: "initData required",
      };
    }

    if (!verifyTelegramWebApp(initData)) {
      return {
        success: false,
        code: 401,
        message: "Invalid Telegram WebApp data",
      };
    }

    const params = new URLSearchParams(initData);

    const user = JSON.parse(params.get("user"));

    const dbUser = await usersDB.findOne({
      telegramId: user.id,
    });

    const dbInitUser = await usersDB.updateOne(
      {
        telegramId: user.id,
      },
      { $set: { initData: initData } },
    );

    if (!dbUser) {
      return {
        success: false,
        code: 404,
        message: "User not found",
      };
    }

    return {
      success: true,
      data: {
        telegramId: user.id,
        username: user.username,
        intData: initData,
      },
    };
  } catch (error) {
    console.error("Telegram WebApp auth error:", error);

    return {
      success: false,
      code: 500,
      message: "Server error",
    };
  }
}

async function verifyWalletAppHandler(data) {
  try {
    const { telegramId, address, signature, message, chain } = data;
    console.log(
      telegramId,
      "3+++++++++++++++++++++++++++++++++++++++++++++",
      telegramId,
      address,
      signature,
      message,
      chain,
    );
    if (!telegramId || !address || !signature || !message || !chain) {
      return {
        success: false,
        code: 400,
        message: "Missing parameters",
      };
    }

    let verified = false;

    if (chain === "EVM") {
      const recovered = ethers.verifyMessage(message, signature);
      verified = recovered.toLowerCase() === address.toLowerCase();
    }

    if (chain === "SOLANA") {
      const publicKey = bs58.decode(address);
      const sig = bs58.decode(signature);
      const msg = new TextEncoder().encode(message);
      verified = nacl.sign.detached.verify(msg, sig, publicKey);
    }

    if (!verified) {
      return {
        success: false,
        code: 401,
        message: "Invalid wallet signature",
      };
    }

    const user = await usersDB.findOne({ telegramId });
    if (!user) {
      return {
        success: false,
        code: 404,
        message: "User not found",
      };
    }

    user.walletAddress = address;
    user.walletChain = chain;
    user.walletVerified = true;
    user.status = "WALLET_CONNECTED";
    await user.save();

    return {
      success: true,
      data: {
        telegramId,
        walletAddress: address,
        chain,
      },
    };
  } catch (error) {
    console.error("Wallet verification error:", error);
    return {
      success: false,
      code: 500,
      message: "Server error",
    };
  }
}

// async function userbetplaceHandler(data) {
//   try {
//     const {
//       initData,
//       marketId,
//       conditionId,
//       outcomeIndex,
//       outcomeLabel,
//       manualId,
//       amount,
//       odds,
//       currency,
//       source = "manual",
//     } = data;

//     if (!initData || !amount || !odds || !currency) {
//       return {
//         success: false,
//         code: 400,
//         message: "Missing parameters",
//       };
//     }

//     if (!verifyTelegramWebApp(initData)) {
//       return {
//         success: false,
//         code: 401,
//         message: "Invalid Telegram data",
//       };
//     }

//     const params = new URLSearchParams(initData);
//     const tgUser = JSON.parse(params.get("user"));
//     // const telegramId = Number('1453204703');
//     const telegramId = tgUser.id;

//     const user = await usersDB.findOne({ telegramId });
//     if (!user) {
//       return {
//         success: false,
//         code: 404,
//         message: "User not found",
//       };
//     }

//     const walletDoc = await UserWallet.findOne({ userId: user._id });
//     if (!walletDoc) {
//       return {
//         success: false,
//         code: 404,
//         message: "Wallet not found",
//       };
//     }

//     const currencyWallet = walletDoc.wallets.find(
//       (w) => w.currencySymbol === currency
//     );

//     if (!currencyWallet || currencyWallet.amount < amount) {
//       return {
//         success: false,
//         code: 400,
//         message: "Insufficient balance",
//       };
//     }

//     const shares = amount / odds;
//     const potentialPayout = shares * 1;
//     const potentialProfit = potentialPayout - amount;

//     currencyWallet.amount -= amount;
//     currencyWallet.holdAmount += amount;
//     await walletDoc.save();

//     const prediction = await Prediction.create({
//       userId: user._id,
//       telegramId,
//       marketId: source === "poly" ? marketId : null,
//       manualId: source === "poly" ? null : manualId,
//       conditionId: source === "poly" ? conditionId : null,
//       outcomeIndex: outcomeIndex,
//       outcomeLabel,
//       amount,
//       odds,
//       shares,
//       potentialPayout,
//       potentialProfit,
//       currency,
//       status: "OPEN",
//       source,
//     });

//     return {
//       success: true,
//       data: prediction,
//       message: "Your bet has been successfully placed",
//     };
//   } catch (error) {
//     console.error("Place bet error:", error);
//     return {
//       success: false,
//       code: 500,
//       message: "Server error",
//     };
//   }
// }

// async function userbetplaceHandler(data) {
//   try {
//     const {
//       initData,
//       token,
//       marketId,
//       conditionId,
//       outcomeIndex,
//       outcomeLabel,
//       manualId,
//       amount,
//       odds,
//       currency,
//       source = "manual",
//     } = data;

//     if (!amount || !odds || !currency) {
//       return { success: false, code: 400, message: "Missing parameters" };
//     }

//     let telegramId = null;
//     let groupId = null;
//     let chatType = "private";

//     if (token) {
//       try {
//         const decoded = jwt.verify(token, jwt_secret);
//         telegramId = decoded.telegramId;
//         groupId = decoded.groupId;
//         chatType = groupId ? "group" : "private";
//       } catch (err) {
//         return { success: false, code: 401, message: "Invalid token" };
//       }
//     } else if (initData) {
//       if (!verifyTelegramWebApp(initData)) {
//         return { success: false, code: 401, message: "Invalid Telegram data" };
//       }

//       const params = new URLSearchParams(initData);
//       const tgUser = JSON.parse(params.get("user"));
//       telegramId = tgUser.id;

//       if (params.get("chat")) {
//         const chat = JSON.parse(params.get("chat"));
//         groupId = chat.id;
//         chatType = chat.type;
//       }
//     } else {
//       return { success: false, code: 400, message: "Missing authentication" };
//     }

//     const user = await usersDB.findOne({ telegramId });
//     if (!user) {
//       return { success: false, code: 404, message: "User not found" };
//     }

//     const walletDoc = await UserWallet.findOne({ telegramId });
//     if (!walletDoc) {
//       return { success: false, code: 404, message: "Wallet not found" };
//     }

//     const currencyWallet = walletDoc.wallets.find(
//       (w) => w.currencySymbol === currency
//     );

//     if (!currencyWallet || currencyWallet.amount < amount) {
//       return { success: false, code: 400, message: "Insufficient balance" };
//     }

//     const shares = amount / odds;
//     const potentialPayout = shares * 1;
//     const potentialProfit = potentialPayout - amount;

//     currencyWallet.amount -= amount;
//     currencyWallet.holdAmount += amount;
//     await walletDoc.save();

//     const prediction = await Prediction.create({
//       userId: user._id,
//       telegramId,
//       groupId,
//       chatType,
//       marketId: source === "poly" ? marketId : null,
//       manualId: source === "poly" ? null : manualId,
//       conditionId: source === "poly" ? conditionId : null,
//       outcomeIndex,
//       outcomeLabel,
//       amount,
//       odds,
//       shares,
//       potentialPayout,
//       potentialProfit,
//       currency,
//       status: "OPEN",
//       source,
//     });

//     return {
//       success: true,
//       data: prediction,
//       message: "Your bet has been successfully placed",
//     };
//   } catch (error) {
//     console.error("Place bet error:", error);
//     return { success: false, code: 500, message: "Server error" };
//   }
// }

// async function userbetplaceHandler(data) {
//   try {
//     const {
//       initData,
//       token,
//       marketId,
//       conditionId,
//       outcomeIndex,
//       outcomeLabel,
//       manualId,
//       amount,
//       odds,
//       currency,
//       source = "manual",
//     } = data;

//     if (!amount || !odds || !currency) {
//       return { success: false, code: 400, message: "Missing parameters" };
//     }

//     let telegramId = null;
//     let groupId = null;
//     let chatType = "private";

//     if (token) {
//       try {
//         const decoded = jwt.verify(token, jwt_secret);
//         telegramId = decoded.telegramId;
//         groupId = decoded.groupId;
//         chatType = groupId ? "group" : "private";
//       } catch (err) {
//         return { success: false, code: 401, message: "Invalid token" };
//       }
//     } else if (initData) {
//       if (!verifyTelegramWebApp(initData)) {
//         return { success: false, code: 401, message: "Invalid Telegram data" };
//       }

//       const params = new URLSearchParams(initData);
//       const tgUser = JSON.parse(params.get("user"));
//       telegramId = tgUser.id;

//       if (params.get("chat")) {
//         const chat = JSON.parse(params.get("chat"));
//         groupId = chat.id;
//         chatType = chat.type;
//       }
//     } else {
//       return { success: false, code: 400, message: "Missing authentication" };
//     }

//     const user = await usersDB.findOne({ telegramId });
//     if (!user) {
//       return { success: false, code: 404, message: "User not found" };
//     }

//     const walletDoc = await UserWallet.findOne({ telegramId });
//     if (!walletDoc) {
//       return { success: false, code: 404, message: "Wallet not found" };
//     }

//     const currencyWallet = walletDoc.wallets.find(
//       (w) => w.currencySymbol === currency,
//     );

//     if (!currencyWallet || currencyWallet.amount < amount) {
//       return { success: false, code: 400, message: "Insufficient balance" };
//     }

//     const shares = amount / odds;
//     const potentialPayout = shares * 1;
//     const potentialProfit = potentialPayout - amount;

//     currencyWallet.amount -= amount;
//     currencyWallet.holdAmount += amount;
//     await walletDoc.save();

//     let tokenId = null;
//     let avgPrice = odds;
//     let currentPrice = odds;
//     let marketQuestion = null;

//     if (source === "poly" && marketId) {
//       const market = await polymarketDB.findOne({ specifyId: marketId });

//       if (market) {
//         marketQuestion = market.question;

//         if (market.outcomeTokenIds instanceof Map) {
//           tokenId = market.outcomeTokenIds.get(outcomeLabel) || null;
//         }

//         if (
//           Array.isArray(market.outcomePrices) &&
//           market.outcomePrices[outcomeIndex] !== undefined
//         ) {
//           avgPrice = parseFloat(market.outcomePrices[outcomeIndex]) || odds;
//           currentPrice = avgPrice;
//         }
//       }
//     }

//     const prediction = await Prediction.create({
//       userId: user._id,
//       telegramId,
//       groupId,
//       chatType,
//       question: marketQuestion,
//       marketId: source === "poly" ? marketId : null,
//       manualId: source === "poly" ? null : manualId,
//       conditionId: source === "poly" ? conditionId : null,
//       outcomeIndex,
//       outcomeLabel,
//       tokenId,
//       amount,
//       odds,
//       shares,
//       avgPrice,
//       currentPrice,
//       potentialPayout,
//       potentialProfit,
//       currency,
//       status: "OPEN",
//       source,
//     });

//     user.totalPredictions += 1;
//     await user.save();

//     await redis.publish(
//       "POLY_NEW_TOKEN",
//       JSON.stringify({
//         tokenId: tokenId,
//       }),
//     );

//     return {
//       success: true,
//       data: prediction,
//       message: "Your bet has been successfully placed",
//     };
//   } catch (error) {
//     console.error("Place bet error:", error);
//     return { success: false, code: 500, message: "Server error" };
//   }
// }


async function userbetplaceHandler(data) {
  try {
    const {
      initData,
      token,
      marketId,
      conditionId,
      outcomeIndex,
      outcomeLabel,
      manualId,
      amount,
      odds,
      currency,
      source = "manual",
    } = data;

    console.log("amount",amount);
    console.log("odds",odds);

    if (!amount || !odds) {
      return { success: false, code: 400, message: "Missing parameters" };
    }

    let telegramId = null;
    let groupId = null;
    let chatType = "private";

    if (token) {
      try {
        const decoded = jwt.verify(token, jwt_secret);
        telegramId = decoded.telegramId;
        groupId = decoded.groupId;
        chatType = groupId ? "group" : "private";
      } catch (err) {
        return { success: false, code: 401, message: "Invalid token" };
      }
    } else if (initData) {
      if (!verifyTelegramWebApp(initData)) {
        return { success: false, code: 401, message: "Invalid Telegram data" };
      }

      const params = new URLSearchParams(initData);
      const tgUser = JSON.parse(params.get("user"));
      telegramId = tgUser.id;

      if (params.get("chat")) {
        const chat = JSON.parse(params.get("chat"));
        groupId = chat.id;
        chatType = chat.type;
      }
    } else {
      return { success: false, code: 400, message: "Missing authentication" };
    }

    const user = await usersDB.findOne({ telegramId });
    if (!user) {
      return { success: false, code: 404, message: "User not found" };
    }

    // --- Fee calculation ---
    const feeSettings = await PlatformFeeSettings.findOne({ status: true });
    const feePercent = feeSettings ? feeSettings.feePercentage : 3;
    const platformFee = (Number(amount) * feePercent) / 100;
    const totalRequired = Number(amount) + platformFee;

    let deductedFrom = null;
    let usedCurrency = null;

    // Check top-level balance (single source of truth)
    const { balance: pubBalance } = await getBalance(telegramId);
    if (pubBalance >= totalRequired) {
      await UserPublicWallet.updateOne(
        { telegramId: String(telegramId) },
        { $inc: { balance: -totalRequired, holdBalance: +Number(amount) } }
      );
      deductedFrom = "userPublicWallet";
      usedCurrency = "USDC";
    }

    if (!deductedFrom) {
      return {
        success: false,
        code: 400,
        message: `Insufficient balance. You have $${pubBalance.toFixed(2)}, need $${totalRequired.toFixed(2)} (includes ${feePercent}% fee)`,
      };
    }

    const shares = amount / odds;
    const potentialPayout = shares * 1;
    const potentialProfit = potentialPayout - amount;

    let tokenId = null;
    let avgPrice = odds;
    let currentPrice = odds;
    let marketQuestion = null;

    if (source === "poly" && marketId) {
      const market = await polymarketDB.findOne({ specifyId: marketId });

      if (market) {
        marketQuestion = market.question;

        if (market.outcomeTokenIds instanceof Map) {
          tokenId = market.outcomeTokenIds.get(outcomeLabel) || null;
        }

        if (
          Array.isArray(market.outcomePrices) &&
          market.outcomePrices[outcomeIndex] !== undefined
        ) {
          avgPrice = parseFloat(market.outcomePrices[outcomeIndex]) || odds;
          currentPrice = avgPrice;
        }
      }
    }

    const prediction = await Prediction.create({
      userId: user._id,
      telegramId,
      groupId,
      chatType,
      question: marketQuestion,
      marketId: source === "poly" ? marketId : null,
      manualId: source === "poly" ? null : manualId,
      conditionId: source === "poly" ? conditionId : null,
      outcomeIndex,
      outcomeLabel,
      tokenId,
      amount,
      odds,
      shares,
      avgPrice,
      currentPrice,
      potentialPayout,
      potentialProfit,
      currency: usedCurrency || currency,
      deductedFrom: deductedFrom,
      status: "OPEN",
      source,
    });

    user.totalPredictions += 1;
    await user.save();

    // --- Fee split at bet time ---
    try {
      const adminWallet = await AdminWallet.findOne({ type: 0 });
      const betCurrency = usedCurrency || currency;

      // Determine referrer: user's referredBy OR the group owner if bet placed in a group
      let referrerTelegramId = user.referredBy || null;
      let referralSource = "link";

      if (!referrerTelegramId && groupId) {
        const group = await TelegramGroup.findOne({ groupId, isActive: true });
        if (group && group.groupOwnerId && group.groupOwnerId !== telegramId) {
          referrerTelegramId = group.groupOwnerId;
          referralSource = "group";
        }
      }

      // Determine market creator
      let creatorTelegramId = null;
      if (source === "manual" && manualId) {
        const market = await Market.findById(manualId).lean();
        if (market && market.creatorTelegramId) {
          creatorTelegramId = market.creatorTelegramId;
        }
      }

      // Calculate splits
      const referrerCut = referrerTelegramId ? platformFee * 0.35 : 0;
      const creatorCut  = creatorTelegramId  ? platformFee * 0.25 : 0;
      const platformCut = platformFee - referrerCut - creatorCut;

      // Credit referrer
      if (referrerCut > 0) {
        await UserPublicWallet.updateOne(
          { telegramId: String(referrerTelegramId) },
          { $inc: { balance: referrerCut } },
          { upsert: true }
        );
        // Update referrer's lifetime earnings
        await usersDB.updateOne(
          { telegramId: referrerTelegramId },
          { $inc: { referralEarnings: referrerCut } }
        );
        // Update referral record
        await Referral.updateOne(
          { referrerId: referrerTelegramId, referredUserId: telegramId },
          { $inc: { totalEarned: referrerCut, totalVolume: Number(amount) } }
        );

        if (adminWallet) {
          await AdminWalletHistory.create({
            adminWalletId: adminWallet._id,
            userId: user._id,
            predictionId: prediction._id,
            currencySymbol: betCurrency,
            amount: referrerCut,
            feePercentage: feePercent * 0.35,
            type: "REFERRAL_FEE",
            recipientTelegramId: referrerTelegramId,
            marketId: source === "manual" ? prediction.manualId : null,
          });
        }
      }

      // Credit market creator
      if (creatorCut > 0) {
        await UserPublicWallet.updateOne(
          { telegramId: String(creatorTelegramId) },
          { $inc: { balance: creatorCut } },
          { upsert: true }
        );
        if (adminWallet) {
          await AdminWalletHistory.create({
            adminWalletId: adminWallet._id,
            userId: user._id,
            predictionId: prediction._id,
            currencySymbol: betCurrency,
            amount: creatorCut,
            feePercentage: feePercent * 0.25,
            type: "CREATOR_FEE",
            recipientTelegramId: creatorTelegramId,
            marketId: source === "manual" ? prediction.manualId : null,
          });
        }
      }

      // Credit platform (admin wallet)
      if (platformCut > 0 && adminWallet) {
        const adminCw = adminWallet.wallets.find((w) => w.currencySymbol === betCurrency);
        if (adminCw) {
          adminCw.amount += platformCut;
          adminWallet.markModified("wallets");
          await adminWallet.save();
        }
        await AdminWalletHistory.create({
          adminWalletId: adminWallet._id,
          userId: user._id,
          predictionId: prediction._id,
          currencySymbol: betCurrency,
          amount: platformCut,
          feePercentage: feePercent,
          type: "PLATFORM_FEE",
          marketId: source === "manual" ? prediction.manualId : null,
        });
      }
    } catch (feeError) {
      // Fee split errors should not fail the bet — log and continue
      console.error("Fee split error (non-fatal):", feeError);
    }

    redis.publish(
      "POLY_NEW_TOKEN",
      JSON.stringify({ tokenId })
    ).catch(() => {}); // non-fatal: Redis may not be available

    return {
      success: true,
      data: prediction,
      message: "Your bet has been successfully placed",
    };
  } catch (error) {
    console.error("Place bet error:", error);
    return { success: false, code: 500, message: "Server error" };
  }
}


async function getActiveBetsForUserHandler(data) {
  try {
    const { telegramId } = data;

    if (!telegramId) {
      return {
        success: false,
        code: 400,
        message: "Missing parameters",
      };
    }

    const activeBets = await Prediction.find({
      telegramId,
      status: "OPEN",
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!activeBets.length) {
      return {
        success: true,
        data: [],
        message: "No active bets found for this user",
      };
    }

    const polyMarketIds = activeBets
      .filter((b) => b.source === "poly" && b.marketId)
      .map((b) => b.marketId);

    const manualMarketIds = activeBets
      .filter((b) => b.source === "manual" && b.manualId)
      .map((b) => b.manualId);

    const polyMarkets = await polymarketDB
      .find({ specifyId: { $in: polyMarketIds } })
      .select("specifyId question")
      .lean();

    const polyMarketMap = {};
    polyMarkets.forEach((m) => {
      polyMarketMap[m.specifyId] = m.question;
    });

    const manualMarkets = await markets
      .find({ _id: { $in: manualMarketIds } })
      .select("question")
      .lean();

    const manualMarketMap = {};
    manualMarkets.forEach((m) => {
      manualMarketMap[m._id.toString()] = m.question;
    });

    const finalData = activeBets.map((bet) => ({
      ...bet,
      question:
        bet.source === "poly"
          ? bet.question || polyMarketMap[bet.marketId] || ""
          : manualMarketMap[bet.manualId?.toString()] || "",
    }));

    return {
      success: true,
      data: finalData,
      message: "Active bets fetched successfully",
    };
  } catch (error) {
    console.error("Error fetching active bets:", error);
    return {
      success: false,
      code: 500,
      message: "Server error",
    };
  }
}

async function getCompletedBetsForUserHandler(data) {
  try {
    const { telegramId } = data;

    if (!telegramId) {
      return {
        success: false,
        code: 400,
        message: "Missing parameters",
      };
    }

    const completedBets = await Prediction.find({
      telegramId,
      status: { $in: ["WON", "LOST", "CLOSED"] },
    })
      .sort({ settledAt: -1, createdAt: -1 })
      .lean();

    if (!completedBets.length) {
      return {
        success: true,
        data: [],
        message: "No completed bets found for this user",
      };
    }

    const polyMarketIds = completedBets
      .filter((b) => b.source === "poly" && b.marketId)
      .map((b) => b.marketId);

    const polyMarkets = await polymarketDB
      .find({ specifyId: { $in: polyMarketIds } })
      .select("specifyId question")
      .lean();

    const polyMarketMap = {};
    polyMarkets.forEach((m) => {
      polyMarketMap[m.specifyId] = m.question;
    });

    const manualMarketIds = completedBets
      .filter((b) => b.source === "manual" && b.manualId)
      .map((b) => b.manualId);

    const manualMarkets = await markets
      .find({ _id: { $in: manualMarketIds } })
      .select("question")
      .lean();

    const manualMarketMap = {};
    manualMarkets.forEach((m) => {
      manualMarketMap[m._id.toString()] = m.question;
    });

    const finalData = completedBets.map((bet) => ({
      ...bet,
      question:
        bet.source === "poly"
          ? bet.question || polyMarketMap[bet.marketId] || ""
          : manualMarketMap[bet.manualId?.toString()] || "",
    }));

    return {
      success: true,
      data: finalData,
      message: "Completed bets fetched successfully",
    };
  } catch (error) {
    console.error("Error fetching completed bets:", error);
    return {
      success: false,
      code: 500,
      message: "Server error",
    };
  }
}

async function getUserProfileHandler(data) {
  try {
    const { telegramId } = data;

    if (!telegramId) {
      return {
        success: false,
        code: 400,
        message: "Missing parameters",
      };
    }

    const user = await usersDB.findOne({ telegramId }).lean();

    if (!user) {
      return {
        success: false,
        code: 404,
        message: "User not found",
      };
    }

    return {
      success: true,
      data: {
        telegramId: user.telegramId,
        username: user.username,
        firstName: user.firstName,
        walletAddress: user.walletAddress,
        walletVerified: user.walletVerified,
        status: user.status,
        winRate: user.winRate,
        totalPredictions: user.totalPredictions,
        totalWins: user.totalWins,
        totalLosses: user.totalLosses,
        createdAt: user.createdAt,
      },
      message: "User profile fetched successfully",
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return {
      success: false,
      code: 500,
      message: "Server error",
    };
  }
}

async function getAddress(data) {
  try {
    const { telegramId } = data;
    const getwallet = await userWallet.findOne({ telegramId: telegramId });
    console.log(getwallet, "getwallet");

    const response = getwallet.wallets.map((w) => ({
      currencyName: w.currencyName,
      currencySymbol: w.currencySymbol,
      currencyId: w.currencyId,
      amount: w.amount,
      address: w.address,
      telegramId: getwallet.telegramId,
    }));

    console.log(response);

    if (getwallet) {
      return {
        success: true,
        code: 200,
        message: "Okay",
        WalletData: response,
      };
    } else {
      return {
        success: false,
        code: 200,
        message: "Missing telegram Id",
      };
    }
  } catch (error) {
    console.log(error, "===");
    return {
      success: false,
      code: 500,
      message: "Server error",
    };
  }
}

async function usertelegramId(data) {
  try {
    console.log(data, "==============");
    const { address } = data;
    // const user = await usersDB.findOne({ initData:address });
    if (address) {
      let user =
        (await usersDB.findOne({ initData: address })) ||
        (await usersDB.findOne({ walletAddress: address })) ||
        (await usersDB.findOne({ telegramId: address }));
      console.log(user, "==============");
      return {
        success: true,
        code: 200,
        message: "Okay",
        data: user.telegramId,
        initData: user.initData,
      };
    } else {
      return {
        success: false,
        code: 200,
        message: "Missing telegram Id",
      };
    }
  } catch (err) {
    console.error("Error fetching completed bets:", err);
    return {
      success: false,
      code: 500,
      message: "Server error",
    };
  }
}

async function UniqueIdHandler(data) {
  try {
    const { uniqueId, telegramId, isConnected } = data;

    if (!uniqueId || !telegramId) {
      return {
        success: false,
        code: 400,
        message: "Missing required fields",
      };
    }

    await usersDB.findOneAndUpdate(
      { telegramId },
      {
        $set: {
          uniqueId,
          isConnected: isConnected ?? false,
        },
      },
      { upsert: true, new: true },
    );

    return {
      success: true,
      code: 200,
      message: "UniqueId & dapp keys stored",
    };
  } catch (error) {
    console.error("UniqueIdHandler error:", error);
    return {
      success: false,
      code: 500,
      message: "Server error",
    };
  }
}

async function getUniqueIdHandler(data) {
  try {
    console.log(data, "getDappKeygetDappKeygetDappKey");
    const { uniqueId } = data;

    const user = await usersDB.findOne({ uniqueId });

    if (!user) {
      return {
        success: false,
        code: 404,
        message: "Invalid uniqueId",
      };
    }
    console.log(user, "----------");
    return {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error("getDappKeyHandler error:", error);
    return {
      success: false,
      code: 500,
      message: "Server error",
    };
  }
}

async function getDappKeyHandler(data) {
  try {
    console.log(data, "getDappKeygetDappKeygetDappKey");
    const { uniqueId } = data;

    const user = await usersDB.findOne({ uniqueId }).select('+dappSecretKey');

    if (!user) {
      return {
        success: false,
        code: 404,
        message: "Invalid uniqueId",
      };
    }

    if (!user.dappSecretKey) {
      return {
        success: false,
        code: 404,
        message: "Dapp key not found for this session",
      };
    }

    return {
      success: true,
      dappSecretKey: user.dappSecretKey,
    };
  } catch (error) {
    console.error("getDappKeyHandler error:", error);
    return {
      success: false,
      code: 500,
      message: "Server error",
    };
  }
}

async function disconnectWalletHandler(data) {
  try {
    const { uniqueId } = data;

    if (!uniqueId) {
      return {
        success: false,
        code: 400,
        message: "uniqueId is required",
      };
    }

    const user = await usersDB.findOne({ uniqueId });

    if (!user) {
      return {
        success: false,
        code: 404,
        message: "Invalid uniqueId",
      };
    }

    await usersDB.updateOne(
      { uniqueId },
      {
        $set: {
          connectedwalletStatus: false,
          isConnected: false,
        },
      },
    );

    return {
      success: true,
      code: 200,
      message: "Wallet disconnected successfully",
    };
  } catch (error) {
    console.error("disconnectWalletHandler error:", error);
    return {
      success: false,
      code: 500,
      message: "Server error",
    };
  }
}

async function getUserByTelegramIdHandler(data) {
  try {
    const { telegramId } = data;

    if (!telegramId) {
      return {
        success: false,
        code: 400,
        message: "telegramId is required",
      };
    }

    const user = await usersDB.findOne(
      { telegramId: Number(telegramId) },
      {
        telegramId: 1,
        uniqueId: 1,
        connectedwalletName: 1,
        connectedwalletAddress: 1,
        connectedwalletStatus: 1,
        isConnected: 1,
        jsonData: 1,
      },
    );

    if (!user) {
      return {
        success: false,
        code: 404,
        message: "User not found",
      };
    }

    return {
      success: true,
      code: 200,
      data: {
        telegramId: user.telegramId,
        uniqueId: user.uniqueId,
        jsonData: user.jsonData,
        wallet: {
          isConnected: user.connectedwalletStatus === true,
          walletName: user.connectedwalletName || null,
          walletAddress: user.connectedwalletAddress || null,
        },
      },
    };
  } catch (error) {
    console.error("getUserByTelegramIdHandler error:", error);
    return {
      success: false,
      code: 500,
      message: "Server error",
    };
  }
}

async function verify_UniqueIdHandler(data) {
  try {
    const {
      uniqueId,
      connectedwalletName,
      connectedwalletAddress,
      connectedwalletStatus,
      Jsondata,
    } = data;

    console.log(data, "-----datata----data---data");
    if (!uniqueId || !connectedwalletAddress) {
      return {
        success: false,
        code: 400,
        message: "Missing required fields",
      };
    }

    const update = await usersDB.findOneAndUpdate(
      { uniqueId },
      {
        $set: {
          connectedwalletName,
          connectedwalletAddress,
          connectedwalletStatus,
          isConnected: true,
          jsonData: Jsondata,
        },
      },
      { new: true },
    );

    if (!update) {
      return {
        success: false,
        code: 404,
        message: "Invalid uniqueId",
      };
    }

    return {
      success: true,
      code: 200,
      message: "Wallet connected successfully",
      data: {
        walletAddress: update.connectedwalletAddress,
      },
    };
  } catch (error) {
    console.error("verify_UniqueIdHandler error:", error);
    return {
      success: false,
      code: 500,
      message: "Server error",
    };
  }
}

async function userDepositListHandler(data) {
  try {
    console.log(data, "depositHandler ");
    const {
      walletAddress,
      WaletName,
      depositAmount,
      currency,
      currencySymbol,
      telegramId,
      depositAddress,
      txHash,
    } = data;
    if (!walletAddress || !depositAmount || !telegramId) {
      return { success: false, code: 404, message: "Invalid fields" };
    }

    // Duplicate guard — check before doing anything
    if (txHash && await isTransactionProcessed(txHash)) {
      console.warn(`Duplicate deposit ignored: ${txHash}`);
      return { success: true, message: "Already processed" };
    }

    // Determine the deposited crypto symbol
    // currencySymbol is the preferred field; fall back to WaletName heuristic
    const rawSymbol = (currencySymbol || "").toUpperCase();
    const isSOL = rawSymbol === "SOL";
    const chain = WaletName === "metamask" ? "ARB" : "SOL";

    // Convert deposited crypto amount → USD
    let usdAmount = parseFloat(depositAmount) || 0;
    if (isSOL) {
      try {
        const priceResp = await axios.get(
          `https://min-api.cryptocompare.com/data/price?fsym=SOL&tsyms=USD`,
          { headers: { Authorization: `Apikey ${process.env.CRYPTO_COMPARE_API_KEY}` } }
        );
        const solToUsd = priceResp.data?.USD || 0;
        usdAmount = parseFloat(depositAmount) * solToUsd;
        console.log(`SOL→USD: ${depositAmount} SOL × $${solToUsd} = $${usdAmount}`);
      } catch (priceErr) {
        console.error("CryptoCompare SOL price fetch failed:", priceErr.message);
        // Proceed with raw amount as fallback
      }
    }
    // USDC (any chain) is already 1:1 with USD — no conversion needed
    usdAmount = parseFloat(usdAmount.toFixed(6));

    const usdcCurrency = await currencyDB.findOne({ currencySymbol: "USDC" });
    if (!usdcCurrency) {
      return { success: false, code: 500, message: "USDC currency record not found" };
    }

    const depositListSave = await depositList.create({
      Address: walletAddress,
      walletName: WaletName,
      Amount: depositAmount,
      AmountUSD: usdAmount,
      status: "COMPLETE",
      telegramId: String(telegramId),
      chain,
      depositAddress: depositAddress,
      txHash: txHash || undefined,
      explorer: txHash ? `${process.env.ARBISCANEXPLORE || "https://solscan.io/tx"}/${txHash}` : "",
      currencyId: String(usdcCurrency._id),
      currencySymbol: rawSymbol || (chain === "ARB" ? "USDC" : usdcCurrency.currencySymbol),
      currencyImage: usdcCurrency.Currency_image || "",
      currencyName: usdcCurrency.currencyName,
      source: WaletName === "metamask" ? "metamask" : "phantom",
    });

    // Credit the single top-level balance (USD-equivalent)
    await userPublicWallet.updateOne(
      { telegramId: String(telegramId) },
      { $inc: { balance: usdAmount } },
      { upsert: true }
    );

    const get_user_init = await usersDB.findOne({ telegramId: telegramId });
    if (depositListSave) {
      return {
        success: true,
        data: get_user_init?.initData,
        message: "Deposit has been successful",
      };
    }
  } catch (error) {
    console.error("Error in userDepositListHandler:", error);
    return { success: false, code: 500, message: "Server error" };
  }
}
async function getCurrenyListHandler(data) {
  try {
    const getCurrenyList = await currencyDB.find({ status: "Active" }).exec();
    if (getCurrenyList) {
      return {
        success: true,
        data: getCurrenyList,
        message: "",
      };
    } else {
      return {
        success: false,
        data: {},
        message: "",
      };
    }
  } catch (error) {
    console.error("Error fetching completed bets:", error);
    return {
      success: false,
      code: 500,
      message: "Server error",
    };
  }
}

async function userWithdrawHandler(data) {
  try {
    // 1. Validate inputs
    const { telegramId, currency, Amount, Address } = data;
    if (!telegramId || !currency || !Amount || !Address) {
      return { success: false, Message: "Invalid fields!" };
    }

    // 2. Convert USD amount → crypto units
    let cryptoAmount = parseFloat(Amount);
    if (currency === "SOL") {
      try {
        const priceResp = await axios.get(
          `https://min-api.cryptocompare.com/data/price?fsym=SOL&tsyms=USD`,
          { headers: { Authorization: `Apikey ${process.env.CRYPTO_COMPARE_API_KEY}` } }
        );
        const solToUsd = priceResp.data?.USD || 0;
        if (solToUsd <= 0) return { success: false, Message: "Could not fetch SOL price" };
        cryptoAmount = parseFloat(Amount) / solToUsd;
      } catch (priceErr) {
        console.error("CryptoCompare SOL price fetch failed:", priceErr.message);
        return { success: false, Message: "Could not fetch SOL price for withdrawal" };
      }
    }
    // USDC (SOL or ARB) is 1:1 with USD — no conversion needed

    // 3. Check userPublicWallet.balance
    const { balance: availableBalance } = await getBalance(telegramId);
    if (availableBalance < parseFloat(Amount)) {
      return { success: false, Message: `Insufficient balance. You have $${availableBalance.toFixed(2)}` };
    }

    // 4. Build admin keypairs from env (no DB needed)
    const _solAdminKeypair = () => {
      if (!process.env.SOLFLARE_PRIVATE_KEY) throw new Error("SOLFLARE_PRIVATE_KEY not set");
      return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(process.env.SOLFLARE_PRIVATE_KEY)));
    };
    const _evmAdminWallet = () => {
      if (!process.env.EVM_PRIVATE_KEY) throw new Error("EVM_PRIVATE_KEY not set");
      const provider = new ethers.JsonRpcProvider(process.env.ARB_RPC_URL || ARB_RPC);
      return new ethers.Wallet(process.env.EVM_PRIVATE_KEY, provider);
    };

    // 5. RESERVE: atomic hold
    await userPublicWallet.updateOne(
      { telegramId: String(telegramId) },
      { $inc: { balance: -parseFloat(Amount), holdBalance: +parseFloat(Amount) } }
    );

    // 6. Create withdrawal record (PENDING)
    const withdrawalDoc = await WithdrawDB.create({
      telegramId: String(telegramId),
      currency_symbol: currency,
      withdraw_address: Address,
      amount: parseFloat(Amount),
      receiveamount: parseFloat(Amount),
      status: 0,
      txn_id: "",
    });

    // 7. Send from admin wallet
    try {
      let txHash;

      if (currency === "SOL") {
        const adminKeypair = _solAdminKeypair();
        const connection = await createConnection();
        const toPublicKey = new PublicKey(Address);
        const lamports = Math.floor(cryptoAmount * LAMPORTS_PER_SOL);
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: adminKeypair.publicKey,
            toPubkey: toPublicKey,
            lamports,
          })
        );
        const sig = await sendAndConfirmTransaction(connection, transaction, [adminKeypair]);
        txHash = sig;

      } else if (currency === "USDC") {
        // USDC SPL token on Solana — admin sends directly
        const adminKeypair = _solAdminKeypair();
        const connection = await createConnection();
        const TOKEN_MINT = new PublicKey(process.env.USDT_MINT);
        const toPublicKey = new PublicKey(Address);
        const adminATA = await getAssociatedTokenAddress(TOKEN_MINT, adminKeypair.publicKey);
        const receiverATA = await getAssociatedTokenAddress(TOKEN_MINT, toPublicKey);
        const tx = new Transaction();
        if (!(await connection.getAccountInfo(receiverATA))) {
          tx.add(
            createAssociatedTokenAccountInstruction(
              adminKeypair.publicKey, receiverATA, toPublicKey, TOKEN_MINT
            )
          );
        }
        const amountRaw = Math.floor(cryptoAmount * 1_000_000); // 6 decimals
        tx.add(
          createTransferInstruction(adminATA, receiverATA, adminKeypair.publicKey, amountRaw)
        );
        const sig = await sendAndConfirmTransaction(connection, tx, [adminKeypair]);
        txHash = sig;

      } else if (currency === "ARB") {
        // ARB USDC (ERC-20) — admin wallet sends directly
        const adminEthWallet = _evmAdminWallet();
        const usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, adminEthWallet);
        const amountParsed = ethers.parseUnits(cryptoAmount.toFixed(6), 6);
        const tx = await usdc.transfer(cleanAddress(Address), amountParsed);
        const receipt = await tx.wait();
        txHash = receipt.hash;

      } else {
        throw new Error(`Unsupported currency: ${currency}`);
      }

      // 7a. SUCCESS — record txHash, clear hold
      await WithdrawDB.updateOne(
        { _id: withdrawalDoc._id },
        { $set: { status: 2, txn_id: txHash } }  // 2 = completed
      );
      await userPublicWallet.updateOne(
        { telegramId: String(telegramId) },
        { $inc: { holdBalance: -parseFloat(Amount) } }
      );
      return { success: true, txHash, status: "COMPLETE", Message: "Withdraw Successfully!" };

    } catch (sendErr) {
      console.error("Withdrawal send failed:", sendErr);
      // 7b. FAILURE — full refund, clear hold
      await WithdrawDB.updateOne(
        { _id: withdrawalDoc._id },
        { $set: { status: 4 } }  // 4 = admincancel / FAILED
      );
      await userPublicWallet.updateOne(
        { telegramId: String(telegramId) },
        { $inc: { balance: +parseFloat(Amount), holdBalance: -parseFloat(Amount) } }
      );
      return { success: false, status: "FAILED", Message: `Withdrawal failed: ${sendErr.message}` };
    }

    if (false) { // (unreachable — new flow returns above)
    // ✅ legacy code removed
      const secretKey = bs58.decode((common.decrypt(selectedWallet.privateKey)));
      const AdminsecretKey = bs58.decode((common.decrypt(selecteAdmindWallet.privateKey)));
      
      const fromKeypair = Keypair.fromSecretKey(secretKey);

      // const toPublicKey = new PublicKey(data.Address);

      const connection = new Connection(
        "https://api.mainnet-beta.solana.com",
        "confirmed",
      );

      const TOKEN_MINT = new PublicKey(process.env.USDT_MINT);
      // const TOKEN_MINT = new PublicKey(process.env.USDT_MINT);
      const mintInfo = await getMint(connection, TOKEN_MINT);
      const decimals = mintInfo.decimals;
      const amountInSol = Math.floor(
        Number(data.Amount) * Math.pow(10, decimals),
      );
    
      // const fromTokenAccount = await getAssociatedTokenAddress(
      //   TOKEN_MINT,
      //   fromKeypair.publicKey,
      // );
      // const toTokenAccount = await getAssociatedTokenAddress(
      //   TOKEN_MINT,
      //   toPublicKey,
      // );
      // // const amountInSol = Number(data.Amount);

      // const transaction = new Transaction();
      // const receiverAtaInfo = await connection.getAccountInfo(toTokenAccount);
      // if (!receiverAtaInfo) {
      //   transaction.add(
      //     createAssociatedTokenAccountInstruction(
      //       fromKeypair.publicKey, // payer
      //       toTokenAccount,
      //       toPublicKey,
      //       TOKEN_MINT,
      //     ),
      //   );
      // }

      // transaction.add(
      //   createTransferInstruction(
      //     fromTokenAccount,
      //     toTokenAccount,
      //     fromKeypair.publicKey,
      //     amountInSol,
      //   ),
      // );

      // const signature = await connection.sendTransaction(transaction, [
      //   fromKeypair,
      // ]);
      // console.log(signature, "signature");
      // await connection.confirmTransaction(signature, "confirmed");
      
const sender = Keypair.fromSecretKey(secretKey);
const adminwallet = Keypair.fromSecretKey(AdminsecretKey);

// receiver
const receiver = new PublicKey(data.Address);

// ATA addresses
const senderATA = await getAssociatedTokenAddress(
  TOKEN_MINT,
  sender.publicKey
);

const receiverATA = await getAssociatedTokenAddress(
  TOKEN_MINT,
  receiver
);

// build tx
const tx = new Transaction();


if (!(await connection.getAccountInfo(receiverATA))) {
  tx.add(
    createAssociatedTokenAccountInstruction(
      adminwallet.publicKey,   // ✅ payer = admin
      receiverATA,
      receiver,
      TOKEN_MINT
    )
  );
}
tx.add(
  createTransferInstruction(
    senderATA,           // from
    receiverATA,         // to
    sender.publicKey,    // owner
    amountInSol * 1_000_000
  )
);

// ✅ admin pays gas
tx.feePayer = adminwallet.publicKey;

// ✅ both must sign
const sig = await sendAndConfirmTransaction(
  connection,
  tx,
  [adminwallet, sender]
);

// create receiver ATA if not exist
// const receiverInfo = await connection.getAccountInfo(receiverATA);

// if (!receiverInfo) {
//   tx.add(
//     createAssociatedTokenAccountInstruction(
//       sender.publicKey,   // payer
//       receiverATA,
//       receiver,
//       TOKEN_MINT
//     )
//   );
// }

// // add transfer
// tx.add(
//   createTransferInstruction(
//     senderATA,
//     receiverATA,
//     sender.publicKey,
//     amountInSol * 1_000_000 // USDC decimals
//   )
// );

// tx.feePayer = sender.publicKey;

// const sig = await sendAndConfirmTransaction(
//   connection,
//   tx,
//   [sender]
// );

      const update_balance = await UserWallet.updateOne(
        {
          telegramId: data.telegramId,
          "wallets.currencyId": data.currency,
        },
        {
          $inc: {
            "wallets.$.amount": -data.Amount,
          },
        },
      );
      const withdraw_obj = {
        fromaddress: fromKeypair.publicKey.toBase58(),
        withdraw_address: toPublicKey.toBase58(),
        amount: amountInSol,
        telegramId: data.telegramId,
        receiveamount: amountInSol,
        status: 1,
        txn_id: signature,
      };
      const createWithdraw = await WithdrawDB.create(withdraw_obj);

      console.log("Withdrawal successful!");
      console.log(
        `Explorer: https://explorer.solana.com/tx/${signature}?cluster=mainnet-beta`,
      );

      if (createWithdraw) {
        return {
          success: true,
          withdraw_obj,
          Message: "Withdraw Successfully!",
        };
      }
      return { success: false, withdraw_obj, Message: "Withdraw failed!" };
    }
    //  else if (findCurrency.currencySymbol == "SOL") {
    //   const secretKey = Uint8Array.from(
    //     JSON.parse(process.env.SOLFLARE_PRIVATE_KEY),
    //   );
    //   const fromKeypair = Keypair.fromSecretKey(secretKey);

    //   const toPublicKey = new PublicKey(data.Address);

    //   const connection = new Connection(
    //     "https://api.mainnet-beta.solana.com",
    //     "confirmed",
    //   );

    //   console.log("enter coin=================================");
    //   if (!process.env.SOLFLARE_PRIVATE_KEY) {
    //     return {
    //       success: false,
    //       Message: "Something went wroung, please try again later",
    //     };
    //   }
    //   if (!data.Amount || !data.Address) {
    //     return { success: false, Message: "Invalid fields" };
    //   }

    //   const balance = await connection.getBalance(fromKeypair.publicKey);
    //   console.log("Balance:", balance / LAMPORTS_PER_SOL, "SOL");

    //   const amountInSol = Number(data.Amount);
    //   const amountInLamports = Math.floor(amountInSol * LAMPORTS_PER_SOL);

    //   if (balance < amountInLamports) {
    //     return {
    //       success: false,
    //       Message:
    //         "Withdrawals are temporarily unavailable,Please tray again later",
    //     };
    //   }

    //   const transaction = new Transaction().add(
    //     SystemProgram.transfer({
    //       fromPubkey: fromKeypair.publicKey,
    //       toPubkey: toPublicKey,
    //       lamports: amountInLamports,
    //     }),
    //   );

    //   console.log("Sending withdrawal transaction...");

    //   const signature = await connection.sendTransaction(transaction, [
    //     fromKeypair,
    //   ]);

    //   await connection.confirmTransaction(signature, "confirmed");

    //   const withdraw_obj = {
    //     fromaddress: fromKeypair.publicKey.toBase58(),
    //     withdraw_address: toPublicKey.toBase58(),
    //     amount: amountInSol,
    //     telegramId: data.telegramId,
    //     receiveamount: amountInSol,
    //     status: 1,
    //     txn_id: signature,
    //   };

    //   const update_balance = await UserWallet.updateOne(
    //     {
    //       telegramId: data.telegramId,
    //       "wallets.currencyId": data.currency,
    //     },
    //     {
    //       $inc: {
    //         "wallets.$.amount": -data.Amount,
    //       },
    //     },
    //   );
    //   const createWithdraw = await WithdrawDB.create(withdraw_obj);

    //   console.log("Withdrawal successful!");
    //   console.log(
    //     `Explorer: https://explorer.solana.com/tx/${signature}?cluster=mainnet-beta`,
    //   );

    //   if (createWithdraw) {
    //     return {
    //       success: true,
    //       withdraw_obj,
    //       Message: "Withdraw Successfully!",
    //     };
    //   }
    //   return { success: false, withdraw_obj, Message: "Withdraw failed!" };
    // }
     else {
      try {
        const provider = new ethers.JsonRpcProvider(process.env.ARB_RPC_URL);
        const wallet = new ethers.Wallet(
          common.decrypt(selectedWallet.privateKey),
          provider,
        );
        // const usdc = new ethers.Contract(
        //   selectedWallet.address,
        //   ERC20_ABI,
        //   wallet,
        // );
 
        // const amount = ethers.parseUnits(
        //   data.Amount.toString(),
        //   6, // USDC decimals
        // );
        // const tx = await usdc.transfer(data.Address, amount);
        // await tx.wait();

        // // ===== DATABASE UPDATES (your logic) =====
        // await UserWallet.updateOne(
        //   {
        //     telegramId: data.telegramId,
        //     "wallets.currencyId": data.currency,
        //   },
        //   {
        //     $inc: {
        //       "wallets.$.amount": -data.Amount,
        //     },
        //   },
        // );

        // await WithdrawDB.create({
        //   fromaddress: wallet.address,
        //   withdraw_address: data.Address,
        //   amount: data.Amount,
        //   telegramId: data.telegramId,
        //   receiveamount: data.Amount,
        //   status: 1,
        //   txn_id: tx.hash,
        // });

        // return {
        //   success: true,
        //   txn_id: tx.hash,
        //   Message: "USDC Withdraw Successful",
        // };
       const adminWallet = await AdminWallet.findOne({});
      if (!adminWallet) {
        throw new Error('Admin wallet not found');
      }
      console.log(adminWallet,"sadsad")
      const adminCurrency = adminWallet.wallets.find(
        w => w.currencySymbol === data.currency
      );

      if (!adminCurrency) {
        throw new Error(`Admin wallet does not have ${config.nativeCurrency}`);
      }
      console.log(adminCurrency.privateKey,"adminCurrency.privatekey")
        const ADMIN_WALLET = new ethers.Wallet(
  common.decrypt(adminCurrency.privateKey),
  provider
);
    console.log(ADMIN_WALLET,"ADMIN_WALLET")
    const usdc = new ethers.Contract(
      USDC_ADDRESS,
      ERC20_ABI,
      wallet
    );
  console.log(usdc,"usdcusdcusdc")
    // -----------------------------
    // AMOUNT
    // -----------------------------
    const amount = ethers.parseUnits(
      data.Amount.toString(),
      6
    );
  console.log(amount,"amountamountamount")
    const usdcBalance = await usdc.balanceOf(wallet.address);
  console.log(usdcBalance,"usdcBalanceusdcBalanceusdcBalance")

    if (usdcBalance < amount) {
      throw new Error("INSUFFICIENT_USDC");
    }

    const gasEstimate = await usdc.transfer.estimateGas(
      data.Address,
      amount
    );

    const gasPrice = await provider.getFeeData();
    const gasNeeded = gasEstimate * gasPrice.maxFeePerGas;

    const ethBalance = await provider.getBalance(wallet.address);
const gasCost =gasNeeded + ethers.parseEther(data.Amount)
const adminBalance = await provider.getBalance(adminCurrency.address);
 console.log(adminBalance,gasCost,adminBalance < gasCost,ethers.formatEther(adminBalance))

if (adminBalance < gasCost) {
   return { success: false,Message:"Admin wallet has insufficient gas. Please try again later.!" };
  }
    // -----------------------------
    // AUTO GAS SPONSOR
    // -----------------------------
    if (ethBalance < gasNeeded) {

      console.log("⚡ Sending gas from admin wallet",gasNeeded + ethers.parseEther(data.Amount),ethers.formatEther(gasNeeded + ethers.parseEther(data.Amount)));

      const topupTx = await ADMIN_WALLET.sendTransaction({
        to: wallet.address,
        value: gasNeeded + ethers.parseEther(data.Amount)
      });

      await topupTx.wait();
    }

    // -----------------------------
    // SEND USDC
    // -----------------------------
    const tx = await usdc.transfer(
      data.Address,
      amount
    );

    const receipt = await tx.wait();
console.log(receipt,"receipt")
    // -----------------------------
    // DATABASE UPDATE
    // -----------------------------

    const withdraw_obj = {
          fromaddress: selectedWallet.address,
          withdraw_address: data.Address,
          amount: data.Amount,
          telegramId:data.telegramId,
          receiveamount: data.Amount,
          status: 1,
          txn_id: receipt.hash,
        };

    await UserWallet.updateOne(
      {
        telegramId: data.telegramId,
        "wallets.currencyId": findCurrency._id,
      },
      {
        $inc: {
          "wallets.$.amount": -Number(data.Amount),
        },
      }
    );
const createWithdraw = await WithdrawDB.create(withdraw_obj);
        console.log("Withdrawal successful!");
      if(createWithdraw){
        return { success: true, withdraw_obj,Message:"Withdraw Successfully!" };
      }
        return { success: false, withdraw_obj,Message:"Withdraw failed!" };
    return {
      success: true,
      txHash: receipt.hash
    };
      } catch (err) {
        console.error("USDC Withdraw Error:", err);
        return {
          success: false,
          Message: "Withdraw failed",
        };
      }

      // const evmWallet = new ethers.Wallet(
      //   process.env.EVM_PRIVATE_KEY,
      //   evmProvider
      // );
      //  const amountInWei = ethers.parseEther(data.Amount.toString());

      //   const balance = await evmProvider.getBalance(evmWallet.address);

      //   if (balance < amountInWei) {
      //     return {
      //       success: false,
      //       Message: "Withdrawals are temporarily unavailable. Please try again later.",
      //     };
      //   }

      //   const tx = await evmWallet.sendTransaction({
      //     to: data.Address,
      //     value: amountInWei,
      //   });

      //   await tx.wait();

      //   const withdraw_obj = {
      //     fromaddress: evmWallet.address,
      //     withdraw_address: data.Address,
      //     amount: data.Amount,
      //     telegramId:data.telegramId,
      //     receiveamount: data.Amount,
      //     status: 1,
      //     txn_id: tx.hash,
      //   };

      //      const update_balance =await UserWallet.updateOne(
      //   {
      //     telegramId: data.telegramId,
      //     "wallets.currencyId": data.currency
      //   },
      //   {
      //     $inc: {
      //       "wallets.$.amount": -data.Amount
      //     }
      //   }
      // );
      //  const createWithdraw = await WithdrawDB.create(withdraw_obj);

    } // close if(false)/else
  } catch (error) {
    console.error("Withdrawal failed:", error);
    return {
      success: false,
      error: error.message,
      Message: "Something went wrong, please try again later!",
    };
  }
}

// async function userBalanceHandler(data) {
//   try {
//     console.log("enter user balance funcaiotn ")
//     const { telegramId } = data;

//     if (!telegramId) {
//       return {
//         success: false,
//         code: 400,
//         message: "Missing parameters",
//       };
//     }
//   const get_balance =await UserWallet.findOne(
//   {telegramId: telegramId});
//   let totalUsdt = 0;
//   let totalUsdtamount = 0;
//   let totalArbamount = 0;
//     let solAmount = 0;
//    console.log(get_balance,"get_balance");
//  get_balance.wallets.forEach((item) => {
//       if (item.currencySymbol === "USDT") {
//         totalUsdt += Number(item.amount);
//         totalUsdtamount += Number(item.amount);
//       }

//       if (item.currencySymbol === "SOL") {
//         solAmount += Number(item.amount);
//       }
//          if (item.currencySymbol === "ARB") {
//         totalArbamount += Number(item.amount);
//       }
//     });

//       const priceRes = await axios.get(
//         "https://min-api.cryptocompare.com/data/price",
//         {
//           params: {
//             fsym: "SOL",
//             tsyms: "USDT",
//           },
//           headers: {
//             Authorization: `Apikey ${process.env.CRYPTO_COMPARE_API_KEY}`,
//           },
//         }
//       );

//       const solToUsdtRate = priceRes.data.USDT;
//       const solUsdtValue = solAmount * solToUsdtRate;
//       const arbUsdtValue = totalArbamount * solToUsdtRate;

//       totalUsdt += solUsdtValue +=arbUsdtValue;

//       return {
//       success: true,
//       data: get_balance,
//       totalUsdt: Number(totalUsdt.toFixed(6)),
//       totalSol: Number(solAmount.toFixed(6)),
//       totalARB: Number(totalArbamount.toFixed(6)),
//       totalUsdtamount: Number(totalUsdtamount.toFixed(6)),
//       message: "Balance fetched successfully",
//     };

//   } catch (error) {
//     console.error("Error fetching balance:", error);
//     return {
//       success: false,
//       code: 500,
//       message: error,
//     }}}

async function getBalance(telegramId) {
  const doc = await UserPublicWallet.findOne({ telegramId: String(telegramId) });
  return {
    balance:     doc?.balance     || 0,
    holdBalance: doc?.holdBalance || 0,
  };
}

async function userBalanceHandler(data) {
  try {
    if (!data.telegramId) {
      return { success: false, code: 400, message: "Missing parameters" };
    }
    const { balance, holdBalance } = await getBalance(data.telegramId);
    return {
      success: true,
      totalUsdt: Number(balance.toFixed(6)),
      holdBalance: Number(holdBalance.toFixed(6)),
      message: "Balance fetched successfully",
    };
  } catch (error) {
    console.error("Error fetching balance:", error);
    return { success: false, code: 500, message: error.message };
  }
}

async function getTelegramGroupListHandler(data) {
  try {
    const {
      page = 1,
      limit = 10,
      keyword = "",
      fromDate,
      toDate,
      bettingEnabled,
      isActive,
    } = data;

    const currentPage = Math.max(1, parseInt(page));
    const pageLimit = parseInt(limit);
    const skip = (currentPage - 1) * pageLimit;

    const matchQuery = {};

    // Date filter
    if (fromDate || toDate) {
      const dateFilter = {};
      if (fromDate) {
        const start = new Date(fromDate);
        start.setHours(0, 0, 0, 0);
        dateFilter.$gte = start;
      }
      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.$lte = end;
      }
      matchQuery.createdAt = dateFilter;
    }

    // Boolean filters
    if (typeof bettingEnabled === "boolean") {
      matchQuery.bettingEnabled = bettingEnabled;
    }

    if (typeof isActive === "boolean") {
      matchQuery.isActive = isActive;
    }

    const pipeline = [
      { $match: matchQuery },

      ...(keyword
        ? [
            {
              $match: {
                $or: [
                  { groupTitle: { $regex: keyword, $options: "i" } },
                  { groupId: Number(keyword) || -1 },
                ],
              },
            },
          ]
        : []),

      { $sort: { createdAt: -1 } },

      { $skip: skip },
      { $limit: pageLimit },

      {
        $project: {
          _id: 1,
          groupId: 1,
          groupTitle: 1,
          groupOwnerId: 1,
          commissionPercent: 1,
          bettingEnabled: 1,
          botIsAdmin: 1,
          isActive: 1,
          createdAt: 1,
        },
      },
    ];

    const [dataList, countResult] = await Promise.all([
      TelegramGroup.aggregate(pipeline),
      TelegramGroup.aggregate([
        ...pipeline.filter((p) => !p.$skip && !p.$limit && !p.$project),
        { $count: "total" },
      ]),
    ]);

    const totalRecords = countResult[0]?.total || 0;
    const totalPages = Math.ceil(totalRecords / pageLimit);

    return {
      status: true,
      message: "Telegram group list fetched successfully.",
      data: dataList,
      totalPages,
      currentPage,
      totalRecords,
    };
  } catch (error) {
    return {
      status: false,
      message: "Error fetching telegram group list.",
      error: error.message,
    };
  }
}

async function updateGroupCommissionHandler(data) {
  try {
    const { groupId, commissionPercent } = data;

    if (commissionPercent < 0 || commissionPercent > 20) {
      return {
        status: false,
        message: "Commission percentage must be between 0 and 20",
      };
    }

    const group = await TelegramGroup.findOne({ groupId });

    if (!group) {
      return {
        status: false,
        message: "Telegram group not found",
      };
    }

    group.commissionPercent = commissionPercent;
    await group.save();

    return {
      status: true,
      message: "Commission percentage updated successfully",
      data: {
        groupId: group.groupId,
        commissionPercent: group.commissionPercent,
      },
    };
  } catch (error) {
    return {
      status: false,
      message: "Error updating commission percentage",
      error: error.message,
    };
  }
}

async function getUserTotalWinningsHandler(data) {
  try {
    const { initData } = data;

    if (!initData) {
      return { success: false, code: 400, message: "Missing authentication" };
    }

    if (!verifyTelegramWebApp(initData)) {
      return { success: false, code: 401, message: "Invalid Telegram data" };
    }

    const params = new URLSearchParams(initData);
    const tgUser = JSON.parse(params.get("user"));
    const telegramId = tgUser.id;

    const user = await usersDB.findOne({ telegramId });

    if (!user) {
      return { success: false, code: 404, message: "User not found" };
    }

    const wins = await Prediction.find({
      userId: user._id,
      status: { $in: ["WON", "CLOSED"] },
      finalPayout: { $gt: 0 },
    });

    let totalUSDT = 0;
    const breakdown = {};

    for (const bet of wins) {
      const currency = (bet.currency || "USDC").toUpperCase();

      const payoutUSDT = Number(bet.finalPayout) || 0;

      totalUSDT += payoutUSDT;

      if (!breakdown[currency]) {
        breakdown[currency] = {
          amount: 0,
          usdtValue: 0,
        };
      }

      breakdown[currency].amount += bet.finalPayout;
      breakdown[currency].usdtValue += payoutUSDT;
    }

    return {
      success: true,
      data: {
        totalWinningsUSDT: Number(totalUSDT.toFixed(6)),
        currencyBreakdown: breakdown,
        totalWinningBets: wins.length,
      },
    };
  } catch (err) {
    console.error("User total winnings error:", err);
    return { success: false, code: 500, message: "Server error" };
  }
}

async function getHomeTodayNewsHandler() {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayPredictions = await Prediction.find({
      createdAt: { $gte: startOfToday, $lte: endOfToday },
    });

    let totalPredictionsToday = todayPredictions.length || 0;
    let totalUSDTBetsToday = 0;

    for (const bet of todayPredictions) {
      totalUSDTBetsToday += Number(bet.amount) || 0;
    }

    const todayWins = await Prediction.find({
      status: { $in: ["WON", "CLOSED"] },
      finalPayout: { $gt: 0 },
      settledAt: { $gte: startOfToday, $lte: endOfToday },
    }).populate("userId");

    const userWinMap = {};

    for (const bet of todayWins) {
      const payoutUSDT = Number(bet.finalPayout) || 0;

      const userId = bet.userId?._id?.toString();
      if (!userId) continue;

      if (!userWinMap[userId]) {
        userWinMap[userId] = {
          user: bet.userId,
          totalUSDT: 0,
        };
      }

      userWinMap[userId].totalUSDT += payoutUSDT;
    }

    const sortedWinners = Object.values(userWinMap).sort(
      (a, b) => b.totalUSDT - a.totalUSDT
    );

    const response = [];

    response.push({
      id: 1,
      description:
        totalPredictionsToday > 0
          ? `Total bets today: $${Number(totalUSDTBetsToday.toFixed(2))} · ${totalPredictionsToday.toLocaleString()} predictions placed`
          : `Total bets today: $0 · 0 predictions placed`,
    });

    if (sortedWinners.length === 0) {
      response.push(
        {
          id: 2,
          description: `Today’s Top Winner: -- +$0`,
        },
        {
          id: 3,
          description: `Today’s Second Top Winner: -- +$0`,
        }
      );
    } else {
      const topTwo = sortedWinners.slice(0, 2);

      topTwo.forEach((winner, index) => {
        response.push({
          id: index + 2,
          description:
            index === 0
              ? `Today’s Top Winner: @${winner.user.username || "user"} +$${Number(winner.totalUSDT.toFixed(2))}`
              : `Today’s Second Top Winner: @${winner.user.username || "user"} +$${Number(winner.totalUSDT.toFixed(2))}`,
        });
      });

      if (topTwo.length === 1) {
        response.push({
          id: 3,
          description: `Today’s Second Top Winner: -- +$0`,
        });
      }
    }

    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error("Home today news error:", error);
    return {
      success: true,
      data: [
        {
          id: 1,
          description: "Total bets today: $0 · 0 predictions placed",
        },
        {
          id: 2,
          description: "Today’s Top Winner: -- +$0",
        },
        {
          id: 3,
          description: "Today’s Second Top Winner: -- +$0",
        },
      ],
    };
  }
}
async function creat_new_wallet(data) {
  try {
    const { telegramId, network } = data;

    if (!telegramId || !network) {
      return {
        status: false,
        message: "telegramId and network are required",
      };
    }
    let userWallet = await userPublicWallet.findOne({ telegramId });
    if (userWallet) {
      const existingWallet = userWallet.wallets.find(
        (w) => w.network === network
      );

      if (existingWallet) {
        // Private key is managed server-side only (custodial model) — never sent to frontend
        return {
          status: true,
          message: "Wallet already exists ,and continue to app" ,
          data: {
            address: existingWallet.address,
            network: existingWallet.network,
          },
        };
      }
    }

    // Create new wallet based on network type
    let newWallet;
    
    if (network === "ARB" || network === "EVM") {
      const wallet = Wallet.createRandom();
      newWallet = {
        network: network,
        address: wallet.address,
        privateKey: common.encrypt(wallet.privateKey),
      };
    } else if (network === "SOL") {
      const keypair = Keypair.generate();
      newWallet = {
        network: "SOL",
        address: keypair.publicKey.toBase58(),
        privateKey: common.encrypt(bs58.encode(keypair.secretKey)),
      };
    } else {
      return {
        status: false,
        message: "Unsupported network. Use ARB, EVM, or SOL",
      };
    }

    // If user doesn't exist, create new user document
    if (!userWallet) {
      userWallet = new userPublicWallet({
        telegramId,
        wallets: [newWallet],
      });
    } else {
      // User exists but doesn't have wallet for this network
      userWallet.wallets.push(newWallet);
    }

    // Save to database
    await userWallet.save();

    // Private key is managed server-side only (custodial model) — never sent to frontend
    return {
      status: true,
      message: "Wallet created successfully, continue to app",
      data: {
        address: newWallet.address,
        network: newWallet.network,
      },
    };
  } catch (error) {
    return {
      status: false,
      message: "Error creating wallet",
      error: error.message,
    };
  }
}
async function isTransactionProcessed(txHash) {
  if (!txHash) return false;
  const exists = await depositList.exists({ txHash: String(txHash) });
  console.log(exists, "exists");
  return !!exists;
}
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getConnectionWithFallback() {
  const rpcs = [
    process.env.SOL_RPC_URL,
    process.env.SOL_RPC_URL2,
  ];

  for (const rpc of rpcs) {
    try {
      const conn = new Connection(rpc, "confirmed");
      await conn.getLatestBlockhash();
      console.log("✅ Using RPC:", rpc);
      return conn;
    } catch (e) {
      console.log("❌ RPC failed:", rpc);
    }
  }

  throw new Error("All RPCs rate limited");
}

async function getSolanaTransactions(address) {
  try {
    if (!address || typeof address !== "string" || address.trim() === "") {
      console.warn("getSolanaTransactions: skipping empty address");
      return [];
    }
    console.log(address,"address");
    const connection = await getConnectionWithFallback();
    const pubKey = new PublicKey(address);
  //  const USDC_MINT =
  //         "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const USDC_MINT = new PublicKey(
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
);
    const ata = await getAssociatedTokenAddress(
  USDC_MINT,
  pubKey
);
const signatures = await connection.getSignaturesForAddress(
  ata,
  { limit: 500 }
);
    // const signatures = await connection.getSignaturesForAddress(pubKey, {
    //   limit: 500, // 🔥 DO NOT USE 1000
    // });
    console.log(signatures,"signatures")

    const transactions = [];
    const batchSize = 3;

    for (let i = 0; i < signatures.length; i += batchSize) {
      const batch = signatures.slice(i, i + batchSize);

      const txs = await Promise.all(
        batch.map(sig =>
          connection.getTransaction(sig.signature, {
            maxSupportedTransactionVersion: 0,
          })
        )
      );
   console.log(txs,"txstxs")
      for (let idx = 0; idx < txs.length; idx++) {
        const tx = txs[idx];
        if (!tx || tx.meta?.err) continue;

        const pre = tx.meta.preTokenBalances || [];
        const post = tx.meta.postTokenBalances || [];

        const USDC_MINT =
          "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

        let amount = 0;
        let from = "";
        let to = "";

        post.forEach(p => {
          if (p.mint !== USDC_MINT) return;

          const preBal =
            pre.find(x => x.accountIndex === p.accountIndex)
              ?.uiTokenAmount.uiAmount || 0;

          const postBal = p.uiTokenAmount.uiAmount || 0;
          const diff = postBal - preBal;

          if (diff > 0) {
            amount = diff;
            to = p.owner;
          } else if (diff < 0) {
            amount = Math.abs(diff);
            from = p.owner;
          }
        });

        if (amount > 0) {
          transactions.push({
            hash: batch[idx].signature,
            from,
            to,
            value: amount.toString(),
            currency: "USDC",
            decimals: 6,
            timestamp: tx.blockTime,
          });
        }
      }
  console.log(transactions,"transactionstransactionstransactions")
      // ✅ CRITICAL: delay between batches
      await sleep(400);
    }

    return transactions;

  } catch (err) {
    console.error("Solana tx fetch failed:", err);
    return [];
  }
}



// async function getSolanaTransactions(address) {
//   try {
//     const connection = PROVIDERS.SOL;
//     const pubKey = new PublicKey(address);
    
//     // Get confirmed signatures (last 1000)
//     const signatures = await connection.getSignaturesForAddress(pubKey, {
//       limit: 200,
//     });
//      console.log(signatures,"+++++++++++++++++++====signatures")
//     const transactions = [];
    
//     // Batch fetch transactions (10 at a time for optimization)
//     const batchSize = 10;
//     for (let i = 0; i < signatures.length; i += batchSize) {
//       const batch = signatures.slice(i, i + batchSize);
//       const txPromises = batch.map((sig) =>
//         connection.getTransaction(sig.signature, {
//           maxSupportedTransactionVersion: 0,
//         })
//       );
      
//       const txs = await Promise.all(txPromises);
//        console.log(txs,"++++tsx++++++++++++++++++++==")
     
//       txs.forEach((tx, idx) => {
//   if (tx && tx.meta && !tx.meta.err) {
 
//     // ✅ CORRECT - Get SPL token balance changes
//     const preTokenBalances = tx.meta.preTokenBalances || [];
//     const postTokenBalances = tx.meta.postTokenBalances || [];
    
//     console.log('Pre Token Balances:', preTokenBalances);
//     console.log('Post Token Balances:', postTokenBalances);
    
//     // Find USDC mint address
//     const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
    
//     // Find token balance changes for USDC
//     let tokenAmount = 0;
//     let fromAddress = '';
//     let toAddress = '';
    
//     // Look for token transfers
//     postTokenBalances.forEach((postToken) => {
//       // Find corresponding pre-balance
//       const preToken = preTokenBalances.find(
//         (pre) => pre.accountIndex === postToken.accountIndex
//       );
      
//       // Check if this is USDC token
//       if (postToken.mint === USDC_MINT) {
//         const preAmount = preToken ? parseFloat(preToken.uiTokenAmount.uiAmountString) : 0;
//         const postAmount = parseFloat(postToken.uiTokenAmount.uiAmountString);
//         const change = postAmount - preAmount;
        
//         console.log(`Account ${postToken.accountIndex}:`, {
//           pre: preAmount,
//           post: postAmount,
//           change: change,
//           owner: postToken.owner
//         });
        
//         // If balance increased, this is the recipient
//         if (change > 0) {
//           tokenAmount = change;
//           toAddress = postToken.owner;
//         }
        
//         // If balance decreased, this is the sender
//         if (change < 0) {
//           fromAddress = postToken.owner;
//           tokenAmount = Math.abs(change);
//         }
//       }
//     });
    
//     // Also check SOL fees (for reference)
//     const postBalance = tx.meta.postBalances[0];
//     const preBalance = tx.meta.preBalances[0];
//     const solFee = (preBalance - postBalance) / 1e9;
    
//     console.log({
//       usdcAmount: tokenAmount,
//       solFee: solFee,
//       from: fromAddress,
//       to: toAddress
//     });
    
//     if (tokenAmount > 0) {
//       transactions.push({
//         hash: batch[idx].signature,
//         from: fromAddress || tx.transaction.message.accountKeys[0].toBase58(),
//         to: toAddress || address,
//         value: tokenAmount.toString(),
//         currency: 'USDC',
//         decimals: 6,
//         solFee: solFee,
//         timestamp: tx.blockTime,
//       });
//     }
//   }
// });
//     }
//      console.log("+++++++++++++++solana transaction++++++++++++++",transactions)
//     return transactions;
//   } catch (error) {
//     console.error("Error fetching Solana transactions:", error);
//     return [];
//   }
// }

async function getEVMTransactions(address, network) {
  try {
    const chainId = CHAIN_IDS[network];

    if (!chainId) {
      throw new Error("Unsupported network");
    }

    const url =
      `https://api.etherscan.io/v2/api` +
      `?chainid=${chainId}` +
      `&module=account` +
      `&action=tokentx` +
      `&contractaddress=${USDC_CONTRACT}` +
      `&address=${address}` +
      `&startblock=0` +
      `&endblock=99999999` +
      `&sort=asc` +
      `&apikey=${process.env.ETHERSCAN_API_KEY}`;

    const { data } = await axios.get(url);

    if (data.status !== "1") {
      return [];
    }
  console.log(data.result.map(tx => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      amount: Number(tx.value) / 10 ** tx.tokenDecimal,
      symbol: tx.tokenSymbol,
      blockNumber: Number(tx.blockNumber),
      timestamp: Number(tx.timeStamp),
      confirmations: Number(tx.confirmations),
    })),"------------------")
    return data.result.map(tx => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      amount: Number(tx.value) / 10 ** tx.tokenDecimal,
      symbol: tx.tokenSymbol,
      blockNumber: Number(tx.blockNumber),
      timestamp: Number(tx.timeStamp),
      confirmations: Number(tx.confirmations),
    }));

  } catch (error) {
    console.error("EVM tx fetch error:", error.message);
    return [];
  }
}

 async function getUserWalletsSimple(telegramId, network) {
  try {
    // Get entire public wallet
    const userPublicWallet = await UserPublicWallet.findOne({ 
      telegramId 
    });

    if (!userPublicWallet) {
      throw new Error('User public wallet not found');
    }

    // Find network wallet
    const publicNetworkWallet = userPublicWallet.wallets.find(
      w => w.network === network
    );

    if (!publicNetworkWallet) {
      throw new Error(`Network ${network} not configured`);
    }

    // Get entire personal wallet
    const userPersonalWallet = await UserWallet.findOne({ 
      telegramId 
    });

    if (!userPersonalWallet) {
      throw new Error('User personal wallet not found');
    }

    // Find currency wallet
    let personalCurrencyWallet = userPersonalWallet.wallets.find(
      w => w.currencySymbol === network
    );

    // If currency doesn't exist, create it
    // if (!personalCurrencyWallet) {
    //   userPersonalWallet.wallets.push({
    //     currencySymbol: currencySymbol,
    //     currencyName: currencySymbol,
    //     amount: 0,
    //     holdAmount: 0,
    //     address: publicNetworkWallet.address // Use same address for now
    //   });
      
    //   await userPersonalWallet.save();
    //   personalCurrencyWallet = userPersonalWallet.wallets[userPersonalWallet.wallets.length - 1];
    // }

    return {
      publicWallet: userPublicWallet,
      publicNetworkWallet,
      personalWallet: userPersonalWallet,
      personalCurrencyWallet
    };

  } catch (error) {
    console.error('Error fetching user wallets:', error);
    throw error;
  }
}

const NETWORK_CONFIG = {
  ARB: {
    rpcUrl: process.env.ARB_RPC_URL || 'https://arb1.arbitrum.io/rpc',
    chainId: 42161,
    nativeCurrency: 'ARB',
    gasLimit: 500000,
    type: 'EIP1559'
  },
};
function cleanAddress(address) {
  if (!address) {
    throw new Error('Address is required');
  }
  
  // Convert to string and remove all problematic characters
  let cleaned = String(address).trim();
  
  // Remove quotes
  cleaned = cleaned.replace(/^["']|["']$/g, '');
  
  // Remove semicolons
  cleaned = cleaned.replace(/;/g, '');
  
  // Remove all unicode control characters and invisible characters
  cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F]/g, ''); // Control chars
  cleaned = cleaned.replace(/[\u200B-\u200D\uFEFF]/g, ''); // Zero-width spaces
  cleaned = cleaned.replace(/\u200E/g, ''); // Left-to-right mark
  cleaned = cleaned.replace(/\u200F/g, ''); // Right-to-left mark
  cleaned = cleaned.replace(/\s/g, ''); // All whitespace
  
  // Validate Ethereum address format
  if (!cleaned.match(/^0x[a-fA-F0-9]{40}$/)) {
    throw new Error(`Invalid Ethereum address format. Got: "${cleaned}" (length: ${cleaned.length})`);
  }
  
  return cleaned;
}


async function estimateUSDCGasFee_EVM(network, fromAddress, toAddress, amount) {
  try {
    console.log(network, fromAddress, toAddress, amount,"network, fromAddress, toAddress, amount")
    const config = NETWORK_CONFIG[network];
    if (!config) {
      throw new Error(`Unsupported network: ${network}`);
    }

    // Setup provider
    const provider = new ethers.JsonRpcProvider(config.rpcUrl);

    // Setup USDC contract (read-only)
    const usdcContract = new ethers.Contract(
      cleanAddress(USDC_ADDRESS),
      ERC20_ABI,
      provider
    );
    console.log(usdcContract,"usdcContract")
    // Get decimals
    const decimals = await usdcContract.decimals();
    const amountInTokens = ethers.parseUnits(amount.toString(), decimals);

    // Estimate gas units needed for the transfer
    let estimatedGasUnits;
    try {
      estimatedGasUnits = await usdcContract.transfer.estimateGas(
        toAddress,
        amountInTokens,
        { from: fromAddress }
      );
    } catch (error) {
      // If estimation fails, use default gas limit
      console.warn('Gas estimation failed, using default:', error.message);
      estimatedGasUnits = BigInt(config.gasLimit);
    }

    // Get current gas price/fee data
    const feeData = await provider.getFeeData();

    let gasCostInWei;
    let gasPriceDetails = {};

    if (config.type === 'EIP1559') {
      // EIP-1559 networks (Ethereum, Polygon, etc.)
      const maxFeePerGas = feeData.maxFeePerGas;
      const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;

      gasCostInWei = estimatedGasUnits * maxFeePerGas;

      gasPriceDetails = {
        gasUnits: estimatedGasUnits.toString(),
        maxFeePerGas: ethers.formatUnits(maxFeePerGas, 'gwei') + ' Gwei',
        maxPriorityFeePerGas: ethers.formatUnits(maxPriorityFeePerGas, 'gwei') + ' Gwei',
        type: 'EIP1559'
      };

    } else {
      // Legacy networks (BSC)
      const gasPrice = feeData.gasPrice;
      gasCostInWei = estimatedGasUnits * gasPrice;

      gasPriceDetails = {
        gasUnits: estimatedGasUnits.toString(),
        gasPrice: ethers.formatUnits(gasPrice, 'gwei') + ' Gwei',
        type: 'Legacy'
      };
    }

    // Convert to native currency
    const gasCostInNative = parseFloat(ethers.formatEther(gasCostInWei));

    // Add 20% buffer for price fluctuations
    const gasCostWithBuffer = gasCostInNative * 1.2;

    console.log(`[${network}] Gas Estimation:`, {
      network,
      gasUnits: gasPriceDetails.gasUnits,
      gasCost: gasCostInNative,
      gasCostWithBuffer,
      currency: config.nativeCurrency,
      ...gasPriceDetails
    });

    return {
      network,
      gasCost: gasCostInNative,
      gasCostWithBuffer,
      gasUnits: estimatedGasUnits.toString(),
      currency: config.nativeCurrency,
      details: gasPriceDetails,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error(`Error estimating gas for ${network}:`, error);
    throw new Error(`Failed to estimate gas fee: ${error.message}`);
  }
}

function parseKeypair(privateKeyString) {
  try {
    // Private key can be in different formats
    let secretKey;

    if (privateKeyString.startsWith('[')) {
      // JSON array format: [1,2,3,...]
      secretKey = Uint8Array.from(JSON.parse(privateKeyString));
    } else if (privateKeyString.includes(',')) {
      // Comma-separated format: "1,2,3,..."
      secretKey = Uint8Array.from(privateKeyString.split(',').map(Number));
    } else {
      // Base58 format (less common)
      secretKey = bs58.decode(privateKeyString);
    }

    return Keypair.fromSecretKey(secretKey);
  } catch (error) {
    throw new Error(`Failed to parse Solana keypair: ${error.message}`);
  }
}

async function createConnection() {
  const rpcs = [
    process.env.SOL_RPC_URL,
    process.env.SOL_RPC_URL2
  ];

  for (const rpc of rpcs) {
    try {
      const conn = new Connection(rpc, "confirmed");
      await conn.getLatestBlockhash();
      return conn;
    } catch (e) {}
  }

  throw new Error("All Solana RPC failed");
}

// async function createConnection() {
//   const rpc1 = process.env.SOL_RPC_URL;
//   const rpc2 = process.env.SOL_RPC_URL2;

//   try {
//     const conn1 = new Connection(rpc1, "confirmed");
//     await conn1.getLatestBlockhash(); // test

//     console.log("✅ Using RPC 1");
//     return conn1;

//   } catch (err) {
//     console.log("⚠️ RPC 1 failed → switching");

//     const conn2 = new Connection(rpc2, "confirmed");
//     await conn2.getLatestBlockhash();

//     console.log("✅ Using RPC 2");
//     return conn2;
//   }
// }
 async function transferUSDC_Solana(telegramId, amount) {
  let adminUpdated = false;
  let publicWalletUpdated = false;

  try {
    const connection = await createConnection();

    /* =======================================================
       STEP 1 — LOAD USER WALLET
    ======================================================= */

    const publicWallet = await UserPublicWallet.findOne({ telegramId });
    const userWallet = await UserWallet.findOne({ telegramId });

    if (!publicWallet || !userWallet)
      throw new Error("Wallet not found");

    const solWallet = publicWallet.wallets.find(w => w.network === "SOL");
    const userCurrency = userWallet.wallets.find(w => w.currencySymbol === "SOL");

    const userKeypair = parseKeypair(common.decrypt(solWallet.privateKey));
    const userPubkey = userKeypair.publicKey;

    const usdcMint = new PublicKey(process.env.SOLANA_USDC_MINT);

    /* =======================================================
       STEP 2 — ADMIN WALLET
    ======================================================= */

    const adminWallet = await AdminWallet.findOne({});
    const adminSOL = adminWallet.wallets.find(w => w.currencySymbol === "SOL");

    const adminKeypair = parseKeypair(
      common.decrypt(adminSOL.privateKey)
    );

    /* =======================================================
       STEP 3 — TOKEN ACCOUNTS
    ======================================================= */

    const userUSDC = await getAssociatedTokenAddress(usdcMint, userPubkey);
    const adminUSDC = await getAssociatedTokenAddress(usdcMint, adminKeypair.publicKey);

    const userAccount = await getAccount(connection, userUSDC).catch(() => null);
    const adminAccount = await getAccount(connection, adminUSDC).catch(() => null);

    const userBalance = userAccount
      ? Number(userAccount.amount) / 1_000_000
      : 0;

    const adminBalance = adminAccount
      ? Number(adminAccount.amount) / 1_000_000
      : 0;

    /* =======================================================
       STEP 4 — DECIDE SENDER
    ======================================================= */

    let senderKeypair;
    let senderTokenAccount;

    if (userBalance >= amount) {
      senderKeypair = userKeypair;
      senderTokenAccount = userUSDC;
    } else {
      if (adminBalance < amount)
        throw new Error("Admin USDC insufficient");

      senderKeypair = adminKeypair;
      senderTokenAccount = adminUSDC;
    }

    /* =======================================================
       STEP 5 — DESTINATION ATA (admin hot wallet — sweep destination)
    ======================================================= */

    const destATA = await getAssociatedTokenAddress(
      usdcMint,
      adminKeypair.publicKey
    );

    const ix = [];

    const ataInfo = await connection.getAccountInfo(destATA);
    if (!ataInfo) {
      ix.push(
        createAssociatedTokenAccountInstruction(
          senderKeypair.publicKey,
          destATA,
          adminKeypair.publicKey,
          usdcMint
        )
      );
    }

    /* =======================================================
       STEP 6 — TRANSFER
    ======================================================= */

    ix.push(
      createTransferInstruction(
        senderTokenAccount,
        destATA,
        senderKeypair.publicKey,
        Math.round(amount * 1_000_000),
        [],
        TOKEN_PROGRAM_ID
      )
    );

    const tx = new Transaction().add(...ix);

    const sig = await connection.sendTransaction(
      tx,
      [senderKeypair],
      { skipPreflight: false }
    );

    await connection.confirmTransaction(sig, "confirmed");

    return {
      success: true,
      txHash: sig,
      from: senderKeypair.publicKey.toBase58(),
      to: adminKeypair.publicKey.toBase58(),
      amount,
      currency: "USDC"
    };

  } catch (err) {
    console.error("USDC transfer failed:", err);
    throw err;
  }
}

// async function transferUSDC_Solana(telegramId, amount) {
//   let adminUpdated = false;
//   let publicWalletUpdated = false;

//   try {
//     console.log(`\n--- Step 1: Fetch Wallets (Solana) ---`);
//     console.log(`Telegram ID: ${telegramId}, Amount: ${amount} USDC`);

//     // Fetch user public wallet
//     const publicWallet = await UserPublicWallet.findOne({ telegramId });
//     if (!publicWallet) {
//       throw new Error('User public wallet not found');
//     }

//     const solWallet = publicWallet.wallets.find(w => w.network === 'SOL');
//     if (!solWallet) {
//       throw new Error('SOL wallet not found in public wallet');
//     }

//     console.log(`SOL Public Wallet Address: ${solWallet.address}`);

//     // Fetch user personal wallet
//     const userWallet = await UserWallet.findOne({ telegramId });
//     if (!userWallet) {
//       throw new Error('User wallet not found');
//     }

//     // Find or create USDC entry
//     let userCurrency = userWallet.wallets.find(w => w.currencySymbol === 'SOL');
//     if (!userCurrency) {
//       console.log('Creating new SOL USDC entry in user wallet');
//       userWallet.wallets.push({
//         currencySymbol: 'SOL',
//         currencyName: 'Solana',
//         amount: 0,
//         holdAmount: 0,
//         address: solWallet.address
//       });
//       await userWallet.save();
//       userCurrency = userWallet.wallets[userWallet.wallets.length - 1];
//     }

//     console.log(`User Wallet Balance: ${userCurrency.amount}`);

//     console.log(`\n--- Step 2: Setup Solana Connection ---`);

//     // Setup Solana connection
//     let connection=  await createConnection();
//     //  connection = new Connection(
//     //   process.env.SOL_RPC_URL || 'https://api.mainnet-beta.solana.com',
//     //   'confirmed'
//     // )
//     //   connection = new Connection(
//     //   process.env.SOL_RPC_UR2 || 'https://api.mainnet-beta.solana.com',
//     //   'confirmed'
//     // )
//     // SOL_RPC_URL2

//     // Parse keypairs
//     const fromPrivateKey = common.decrypt(solWallet.privateKey);
//     const fromKeypair = parseKeypair(fromPrivateKey);
//     const fromPubkey = fromKeypair.publicKey;

//     const toPubkey = new PublicKey(userCurrency.address);
//     const usdcMint = new PublicKey(process.env.SOLANA_USDC_MINT);

//     console.log(`From: ${fromPubkey.toString()}`);
//     console.log(`To: ${toPubkey.toString()}`);

//     console.log(`\n--- Step 3: Get Token Accounts ---`);

//     // Get associated token accounts
//     const fromTokenAccount = await getAssociatedTokenAddress(
//       usdcMint,
//       fromPubkey
//     );

//     const toTokenAccount = await getAssociatedTokenAddress(
//       usdcMint,
//       toPubkey
//     );

//     console.log(`From Token Account: ${fromTokenAccount.toString()}`);
//     console.log(`To Token Account: ${toTokenAccount.toString()}`);

//     // Check if source token account exists and get balance
//     let sourceTokenAccountInfo;
//     try {
//       sourceTokenAccountInfo = await getAccount(connection, fromTokenAccount);
//       const usdcBalance = Number(sourceTokenAccountInfo.amount) / 1_000_000; // USDC has 6 decimals
//       console.log(`Source USDC Balance: ${usdcBalance}`);

//       if (usdcBalance < amount) {
//         throw new Error(`Insufficient USDC balance. Have: ${usdcBalance}, Need: ${amount}`);
//       }
//     } catch (error) {
//       console.log(error,"===erereor")
//       throw new Error(`Source token account not found or error: ${error.message}`);
//     }

//     // Check if destination token account exists
//     let needsToCreateDestAccount = false;
    
//     try {
//       await getAccount(connection, toTokenAccount);
//       console.log('Destination token account exists');
//     } catch (error) {
//       console.log('Destination token account does NOT exist - will create');
//       needsToCreateDestAccount = true;
//     }

//     console.log(`\n--- Step 4: Check SOL Balance for Fees ---`);

//     // Check SOL balance for transaction fees
//     const solBalance = await connection.getBalance(fromPubkey);
//     const solBalanceInSOL = solBalance / LAMPORTS_PER_SOL;

//     console.log(`SOL Balance: ${solBalanceInSOL} SOL`);

//     // Estimate transaction fee
//     let estimatedFee = 0.000005; // Base transaction fee

//     if (needsToCreateDestAccount) {
//       estimatedFee += 0.00203928; // Account rent exemption (~0.002 SOL)
//       console.log('Need to create destination token account (+0.002 SOL)');
//     }

//     const feeWithBuffer = estimatedFee * 1.5; // 50% buffer
//     console.log(`Estimated Fee: ${estimatedFee} SOL`);
//     console.log(`Fee with Buffer: ${feeWithBuffer} SOL`);

//     let needsGasFromAdmin = false;
//     let gasTransferTxHash = null;
//     let gasAmountTransferred = 0;

//     // Check if need SOL from admin
//     if (solBalanceInSOL < feeWithBuffer) {
//       needsGasFromAdmin = true;
//       gasAmountTransferred = feeWithBuffer - solBalanceInSOL + 0.001; // Add extra buffer
//       console.log(`\n--- Step 5: Transfer SOL from Admin ---`);
//       console.log(`Insufficient SOL! Need ${gasAmountTransferred} SOL from admin`);

//       // Get admin wallet
//       const adminWallet = await AdminWallet.findOne({});
//       if (!adminWallet) {
//         throw new Error('Admin wallet not found');
//       }

//       const adminSOL = adminWallet.wallets.find(w => w.currencySymbol === 'SOL');
//       if (!adminSOL) {
//         throw new Error('Admin wallet does not have SOL');
//       }

//       console.log(`Admin SOL Balance: ${adminSOL.amount}`);

//       if (adminSOL.amount < gasAmountTransferred) {
//         throw new Error(
//           `Insufficient SOL in admin wallet. Have: ${adminSOL.amount}, Need: ${gasAmountTransferred}`
//         );
//       }

//       // Get admin private key
//       const adminPrivateKey = common.decrypt(adminSOL.privateKey);
//       if (!adminPrivateKey) {
//         throw new Error('Admin SOL private key not found');
//       }

//       const adminKeypair = parseKeypair(adminPrivateKey);

//       console.log(`Admin Address: ${adminKeypair.publicKey.toString()}`);

//       // Update admin balance
//       adminSOL.amount -= gasAmountTransferred;
//       adminSOL.holdAmount += gasAmountTransferred;
//       await adminWallet.save();
//       adminUpdated = true;

//       console.log(`Admin balance updated: ${adminSOL.amount} SOL`);

//       // Transfer SOL from admin to user
//       console.log(`Sending ${gasAmountTransferred} SOL from admin to user...`);

//       const adminTx = new Transaction().add(
//         SystemProgram.transfer({
//           fromPubkey: adminKeypair.publicKey,
//           toPubkey: fromPubkey,
//           lamports: Math.ceil(gasAmountTransferred * LAMPORTS_PER_SOL)
//         })
//       );

//       const { blockhash } = await connection.getLatestBlockhash('confirmed');
//       adminTx.recentBlockhash = blockhash;
//       adminTx.feePayer = adminKeypair.publicKey;

//       gasTransferTxHash = await connection.sendTransaction(adminTx, [adminKeypair]);
//       console.log(`SOL Transfer TX: ${gasTransferTxHash}`);

//       console.log('Waiting for SOL transfer confirmation...');
//       await connection.confirmTransaction(gasTransferTxHash, 'confirmed');
//       console.log('✅ SOL transfer confirmed');

//     } else {
//       console.log(`\n--- Step 5: Sufficient SOL Available (Skip Admin Transfer) ---`);
//     }

//     console.log(`\n--- Step 6: Hold USDC in Public Wallet ---`);

//     // Hold USDC
//     solWallet.amount -= amount;
//     solWallet.holdAmount += amount;
//     await publicWallet.save();
//     publicWalletUpdated = true;

//     console.log(`USDC held: ${amount}`);
//     console.log(`New public wallet balance: ${solWallet.amount}`);

//     console.log(`\n--- Step 7: Build USDC Transfer Transaction ---`);

//     // Build transaction
//     const transaction = new Transaction();

//     // If destination token account doesn't exist, create it first
//     if (needsToCreateDestAccount) {
//       console.log('Adding instruction to create destination token account');
//       transaction.add(
//         createAssociatedTokenAccountInstruction(
//           fromPubkey,           // payer
//           toTokenAccount,       // associated token account
//           toPubkey,            // owner
//           usdcMint             // mint
//         )
//       );
//     }

//     // Add USDC transfer instruction
//     const amountInLamports = Math.floor(amount * 1_000_000); // USDC has 6 decimals
//     console.log(`Transferring ${amount} USDC (${amountInLamports} lamports)`);

//     transaction.add(
//       createTransferInstruction(
//         fromTokenAccount,     // source
//         toTokenAccount,       // destination
//         fromPubkey,          // owner
//         amountInLamports,    // amount
//         [],                  // multi-signers
//         TOKEN_PROGRAM_ID
//       )
//     );

//     // Set recent blockhash and fee payer
//     const { blockhash: txBlockhash } = await connection.getLatestBlockhash('confirmed');
//     transaction.recentBlockhash = txBlockhash;
//     transaction.feePayer = fromPubkey;

//     console.log('Transaction built successfully');

//     console.log(`\n--- Step 8: Send USDC Transfer Transaction ---`);

//     // Sign and send transaction
//     const signature = await connection.sendTransaction(transaction, [fromKeypair]);
//     console.log(`USDC Transfer TX: ${signature}`);

//     console.log('Waiting for USDC transfer confirmation...');
//     const confirmation = await connection.confirmTransaction(signature, 'confirmed');

//     if (confirmation.value.err) {
//       throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
//     }

//     console.log('✅ USDC transfer confirmed');

//     console.log(`\n--- Step 9: Update Final Balances ---`);

//     // Release hold and update balances
//     solWallet.holdAmount -= amount;
//     userCurrency.amount += amount;

//     // If gas was provided by admin, release hold
//     if (needsGasFromAdmin) {
//       const adminWallet = await AdminWallet.findOne({});
//       const adminSOL = adminWallet.wallets.find(w => w.currencySymbol === 'SOL');
//       adminSOL.holdAmount -= gasAmountTransferred;
//       await adminWallet.save();
//       console.log(`Admin hold released: ${gasAmountTransferred} SOL`);
//     }

//     await publicWallet.save();
//     await userWallet.save();

//     console.log(`Final User Wallet Balance: ${userCurrency.amount}`);

//     return {
//       success: true,
//       message: 'Solana USDC transfer completed successfully',
//       network: 'SOL',
//       amount,
//       currency: 'USDC',
//       txHash: signature,
//       gasTransferTxHash,
//       gasFromAdmin: needsGasFromAdmin,
//       gasFee: estimatedFee,
//       accountCreated: needsToCreateDestAccount,
//       finalBalance: userCurrency.amount,
//       timestamp: new Date().toISOString()
//     };

//   } catch (error) {
//     console.error('\n❌ Solana USDC transfer error:', error);

//     // Rollback logic
//     console.log('\n--- Attempting Rollback ---');

//     try {
//       if (needsGasFromAdmin && adminUpdated) {
//         const adminWallet = await AdminWallet.findOne({});
//         const adminSOL = adminWallet.wallets.find(w => w.currencySymbol === 'SOL');
//         if (adminSOL) {
//           adminSOL.amount += gasAmountTransferred;
//           adminSOL.holdAmount -= gasAmountTransferred;
//           await adminWallet.save();
//           console.log('✅ Admin wallet rollback completed');
//         }
//       }

//       if (publicWalletUpdated) {
//         const publicWallet = await userPublicWallet.findOne({ telegramId });
//         const solWallet = publicWallet.wallets.find(w => w.network === 'SOL');
//         if (solWallet) {
//           solWallet.amount += amount;
//           solWallet.holdAmount -= amount;
//           await publicWallet.save();
//           console.log('✅ Public wallet rollback completed');
//         }
//       }
//     } catch (rollbackError) {
//       console.error('❌ Rollback failed:', rollbackError.message);
//       console.error('CRITICAL: Manual intervention required!');
//     }

//     throw error;
//   }
// }


async function transferUSDC_EVM(telegramId, network, amount) {
  let adminUpdated = false;
  let publicWalletUpdated = false;
  let userWalletUpdated = false;

  try {
    console.log(`\n--- Step 1: Fetch Wallets ---`,telegramId, network, amount);

    // Fetch user public wallet
    const publicWallet = await userPublicWallet.findOne({ telegramId });
    if (!publicWallet) {
      throw new Error('User public wallet not found');
    }

    const networkWallet = publicWallet.wallets.find(w => w.network === network);
    if (!networkWallet) {
      throw new Error(`Network ${network} not found in public wallet`);
    }

    console.log(`Public Wallet Address: ${networkWallet.address}`);
    console.log(`Public Wallet USDC Balance: ${networkWallet.amount}`);

    // Fetch user personal wallet
    const userWallet = await UserWallet.findOne({ telegramId });
    if (!userWallet) {
      throw new Error('User wallet not found');
    }
    // Find or create USDC entry in user wallet
    let userCurrency = userWallet.wallets.find(w => w.currencySymbol === network);
    console.log(`usercurrenc:${userCurrency}`)
    if (!userCurrency) {
      console.log('Creating new USDC entry in user wallet');
      userWallet.wallets.push({
        currencySymbol: network,
        currencyName: network,
        amount: 0,
        holdAmount: 0,
        address: networkWallet.address // Same address for now
      });
      await userWallet.save();
      userCurrency = userWallet.wallets[userWallet.wallets.length - 1];
    }

    console.log(`User Wallet USDC Balance: ${userCurrency.amount}`);

    // Verify USDC balance in public wallet
    const config = NETWORK_CONFIG[network];
    const provider = new ethers.JsonRpcProvider(config.rpcUrl);
    const usdcAddress = cleanAddress(USDC_ADDRESS);
    const userWalletInstance = new ethers.Wallet(common.decrypt(networkWallet.privateKey), provider);
    const usdcContract = new ethers.Contract(usdcAddress, ERC20_ABI, userWalletInstance);
    const rawBalance = await usdcContract.balanceOf(networkWallet.address);
    
// ✅ correct
const balance = Number(
  ethers.formatUnits(rawBalance, 6)
);

    console.log(`rewbalance ::${balance}`)
    console.log(`\n--- Step 2: Estimate Gas Fee ---`);

    // Estimate gas fee
    const gasEstimate = await estimateUSDCGasFee_EVM(
      network,
      networkWallet.address,
      userCurrency.address,
      amount,
      'USDC'
    );
    console.log(`Estimated Gas: ${gasEstimate.gasCostWithBuffer} ${gasEstimate.currency}`);
    console.log(`\n--- Step 3: Check Native Token Balance for Gas ---`);
    // Check native token balance (for gas)
    const nativeBalance = await provider.getBalance(networkWallet.address);
    const nativeBalanceInEther = parseFloat(ethers.formatEther(nativeBalance));

    console.log(`Native Token Balance: ${nativeBalanceInEther} ${config.nativeCurrency}`);
    console.log(`Required for Gas: ${gasEstimate.gasCostWithBuffer} ${config.nativeCurrency}`);

    let needsGasFromAdmin = false;
    let gasTransferTxHash = null;
    let gasAmountTransferred = 0.00001;

      const adminWallet = await AdminWallet.findOne({});
      if (!adminWallet) {
        throw new Error('Admin wallet not found');
      }
      const adminCurrency = adminWallet.wallets.find(
        w => w.currencySymbol === config.nativeCurrency
      );

      if (!adminCurrency) {
        throw new Error(`Admin wallet does not have ${config.nativeCurrency}`);
      }

    const getAdminbalance = await provider.getBalance(adminCurrency.address);
    console.log(getAdminbalance,"getAdminbalance");
        const AdminnativeBalanceInEther = parseFloat(ethers.formatEther(getAdminbalance));
    console.log(AdminnativeBalanceInEther,"AdminnativeBalanceInEther");

const adminUSDCBalance = await usdcContract.balanceOf(adminCurrency.address);
const decimalsUSDC = await usdcContract.decimals();
const adminUSDCBalanceFormatted = parseFloat(ethers.formatUnits(adminUSDCBalance, decimalsUSDC));

console.log(`Admin USDC Balance (raw): ${adminUSDCBalance.toString()}`);
console.log(`Admin USDC Balance (formatted): ${adminUSDCBalanceFormatted} USDC`);

      const adminPrivateKey =common.decrypt(adminCurrency.privateKey);
      console.log(adminPrivateKey,"adminPrivateKey")
      if (!adminPrivateKey) {
        throw new Error(`Admin private key not found for ${network}`);
      }
      const adminWalletInstance = new ethers.Wallet(adminPrivateKey, provider);
      console.log(`Sending ${gasAmountTransferred} ${config.nativeCurrency} from admin to user...`);
      console.log(adminWalletInstance,"adminWalletInstance");
      const gasAmount = Number(0.00001).toFixed(6);
      console.log(networkWallet.address,"networkWallet.address")
    
const feeData = await provider.getFeeData();
const gasTx = await adminWalletInstance.sendTransaction({
  to: networkWallet.address,
  value: ethers.parseEther(gasAmount),
  gasLimit: 100000,
  maxFeePerGas: feeData.maxFeePerGas,
  maxPriorityFeePerGas: feeData.maxPriorityFeePerGas
});
   console.log(gasTx,"=============gasTx=gasTxgasTxgasTxgasTxgasTx===============")
      gasTransferTxHash = gasTx.hash;
      console.log(`Gas Transfer TX: ${gasTransferTxHash}`);
      console.log('Waiting for gas transfer confirmation...');
      await gasTx.wait();
      console.log('✅ Gas transfer confirmed');
      console.log(`\n--- Step 5: Hold USDC Amount in Public Wallet ---`);
    // Hold USDC in public wallet BEFORE blockchain transfer
    networkWallet.amount -= amount;
    networkWallet.holdAmount += amount;
    await publicWallet.save();
    publicWalletUpdated = true;
    console.log(`USDC held: ${amount}`);
    console.log(`New public wallet balance: ${networkWallet.amount}`);
    console.log(`\n--- Step 6: Execute USDC Transfer on Blockchain ---`);
    
    // Get decimals
    const decimals = await usdcContract.decimals();
    const amountInTokens = ethers.parseUnits(amount.toString(), decimals);
    // Sweep destination is admin wallet (not user personal wallet)
    const adminEVMAddress = adminCurrency.address;
    console.log(`Sweeping ${amount} USDC to admin at ${adminEVMAddress}...`);

    // Execute transfer
    const transferTx = await usdcContract.transfer(
      adminEVMAddress,
      amountInTokens
    );

    console.log(`USDC Transfer TX: ${transferTx.hash}`);
    console.log('Waiting for confirmation...');

    const receipt = await transferTx.wait();
    console.log(`✅ USDC transfer confirmed in block ${receipt.blockNumber}`);
    console.log(`\n--- Step 7: Update Final Balances ---`);

    // Release hold and update balances
    networkWallet.holdAmount -= amount;
    userCurrency.amount += amount;

    await publicWallet.save();
    await userWallet.save();
    userWalletUpdated = true;

    console.log(`Final User Wallet USDC Balance: ${userCurrency.amount}`);

    return {
      success: true,
      message: 'USDC transfer completed successfully',
      network,
      amount,
      currency: 'USDC',
      txHash: transferTx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      gasTransferTxHash,
      gasFee: gasEstimate.gasCost,
      finalBalance: userCurrency.amount,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('\n❌ EVM USDC transfer error:', error);
    if(error.code == "INSUFFICIENT_FUNDS"){
      throw ("Admin has insufficient funds")
    }
    throw error;
  }
}

async function processAllWalletDeposits() {
  console.log("🔄 Starting deposit check...");
  const startTime = Date.now();
  try {
    // Get all user wallets (optimized: lean() for faster query)
    const userWallets = await UserPublicWallet.find({})
      .select("telegramId wallets")
      .lean();
    
    console.log(`📊 Found ${userWallets.length} users`);
    
    // Prepare bulk operations for better performance
    const depositInserts = [];
    const walletUpdates = [];
let result;
    
    // Process each user's wallets
    for (const user of userWallets) {
      for (const wallet of user.wallets) {
        const { address, network, telegramId } = wallet;
        console.log(`\n🔍 Checking ${network} wallet: ${address}`);
        // Fetch transactions based on network
        let transactions = [];
        if (network === "SOL") {
          transactions = await getSolanaTransactions(address);
        } else if (network === "ETH" || network === "ARB" || network === "EVM") {
          transactions = await getEVMTransactions(address, network);
        }
        console.log(`   Found ${transactions} transactions`);
        // Process each transaction
        // for (const tx of transactions) {
        //   // Check if already processed (optimized check)
        //   const isProcessed = await isTransactionProcessed(tx.hash);
          
        //   if (isProcessed) {
        //     console.log(`   ⏭️  Skip: ${tx.hash.substring(0, 10)}... (already processed)`);
        //     continue;
        //   }
        //   const amount = parseFloat(tx.value);
        //   if (amount <= 0) continue;
          
        //   console.log(`   ✅ New deposit: ${amount} ${network} - ${tx.hash.substring(0, 10)}...`);
          for (const tx of transactions) {

  const isProcessed = await isTransactionProcessed(tx.hash);

  if (isProcessed) {
    console.log(
      `   ⏭️ Skip: ${tx.hash.substring(0, 10)}... (already processed)`
    );
    continue;
  }

  const amount = parseFloat(tx.amount|| tx.value);

  if (amount <= 0) continue;

  console.log(
    `   ✅ New deposit: ${amount} ${tx.symbol} - ${tx.hash.substring(0, 10)}...`
  );
          const currency = CURRENCY_CONFIG[network] || CURRENCY_CONFIG.ETH;
          depositInserts.push({
            telegramId: user.telegramId,
            Address: address,
            walletName: `${network} Wallet`,
            currencyId: network,
            currencySymbol: currency.symbol,
            currencyImage: currency.image,
            currencyName: currency.name,
            status: "COMPLETE",
            Amount: amount,
            depositAddress: tx.hash || tx.txHash,
            txHash: tx.hash || tx.txHash,
            source: "custodial",
          });
          console.log(depositInserts,"---- depositInserts-----")
          // Prepare wallet balance update
          walletUpdates.push({
            telegramId: user.telegramId,
            network: network,
            address: address,
            amountToAdd: amount,
          });

           const get_Fees = await getUserWalletsSimple(user.telegramId, network);
    console.log(get_Fees,"==================================");
    const  getPublicwalletaddress = get_Fees.publicNetworkWallet.address
    const  getPersonalwalletaddress = get_Fees.personalCurrencyWallet.address
    let estimate  =''
// if(network=="ARB"){
//   estimate = await estimateUSDCGasFee_EVM(
//      network,
//     getPersonalwalletaddress,
//     getPublicwalletaddress,
//     amount,
//     'USDC'
//   );
// }else{
//    estimate = await estimateGasFee(
//      network,
//     getPersonalwalletaddress,
//     getPublicwalletaddress,
//     amount,
//     'USDC'
//   );
// }
    if (depositInserts.length > 0) {
      console.log(`\n💾 Inserting ${depositInserts.length} new deposits...`);
      await depositList.insertMany(depositInserts, { ordered: false });
    }

    if (walletUpdates.length > 0) {
      console.log(`💰 Updating ${walletUpdates.length} wallet balances...`);
      for (const update of walletUpdates) {
        await UserPublicWallet.updateOne(
          { telegramId: update.telegramId },
          { $inc: { balance: update.amountToAdd } }
        );
      }
    }
    //  if (walletUpdates.length > 0) {
    //   console.log(`💰 Updating ${walletUpdates.length} wallet balances...`);
    //   for (const update of walletUpdates) {
    //     await UserWallet.updateOne(
    //       {
    //         telegramId: update.telegramId,
    //         "wallets.currencySymbol": update.network,
    //       },
    //       {
    //         $inc: {
    //           "wallets.$.amount": update.amountToAdd,
    //         },
    //       }
    //     );
    //   }
    // }
    if (network === 'SOL') {
      result = await transferUSDC_Solana(user.telegramId, amount);
    } else if (network === 'ARB' || network === 'EVM') {
      result = await transferUSDC_EVM(user.telegramId, network, amount);
    } else {
      console.warn(`Unsupported network for sweep: ${network} — skipping`);
    }
    console.log(result,"--------------------------");
        }
      }
    }
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    console.log(`\n✅ Deposit check completed in ${duration}s`);
    console.log(`📥 New deposits: ${depositInserts.length}`);
    console.log(`💰 Wallets updated: ${walletUpdates.length}`);

    return {
      success: true,
      newDeposits: depositInserts.length,
      walletsUpdated: walletUpdates.length,
      duration: duration,
    };
    
  } catch (error) {
    console.error("❌ Error processing deposits:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
// cron.schedule("0 * * * *", async () => { // One hour cron
// cron.schedule("*/30 * * * *", async () => {
  // cron.schedule("*/10 * * * *", async () => {
cron.schedule("*/2 * * * *", async () => {
  console.log("\n⏰ Cron job triggered: Checking deposits...");
  await processAllWalletDeposits();
});

async function get_deposit_list(data) {
  try {
    const { telegramId } = data || {};
    if (!telegramId) {
      return { success: false, code: 400, message: "Missing telegramId" };
    }
    const all = await depositList
      .find({ telegramId: String(telegramId) })
      .sort({ createdAt: -1 })
      .lean();
    return { success: true, data: all };
  } catch (error) {
    console.error("get_deposit_list error:", error);
    return { success: false, code: 500, message: "Server error" };
  }
}

async function getUserWithdrawList(data) {
  try {
    const { telegramId } = data || {};
    if (!telegramId) {
      return { success: false, code: 400, message: "Missing telegramId" };
    }
    const WithdrawDB = require("../models/withdraw");
    const list = await WithdrawDB
      .find({ telegramId: String(telegramId) })
      .sort({ created_at: -1 })
      .lean();
    return { success: true, data: list };
  } catch (error) {
    console.error("getUserWithdrawList error:", error);
    return { success: false, code: 500, message: "Server error" };
  }
}

/**
 * Generate a random 7-character uppercase alphanumeric invite code (e.g. ARKX7K2)
 */
function generateInviteCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 7; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * createUserMarketHandler
 * Creates a new user-submitted market (starts as pending/inactive for admin approval).
 */
async function createUserMarketHandler(data) {
  try {
    const { question, outcomes, endDate, startDate, isPrivate, oracleType, telegramId,
            tags, initialLiquidity, probabilities } = data;

    if (!telegramId) return { status: false, message: "Telegram ID required" };
    if (!question || question.length < 10 || question.length > 150) {
      return { status: false, message: "Question must be 10–150 characters" };
    }
    if (!outcomes || !Array.isArray(outcomes) || outcomes.length < 2 || outcomes.length > 5) {
      return { status: false, message: "Provide 2–5 outcomes" };
    }
    if (!endDate || new Date(endDate) <= new Date()) {
      return { status: false, message: "End date must be in the future" };
    }

    let inviteCode = null;
    let inviteLink = null;
    if (isPrivate) {
      inviteCode = generateInviteCode();
      const BOT_USERNAME = process.env.BOT_USERNAME || "";
      inviteLink = BOT_USERNAME
        ? `https://t.me/${BOT_USERNAME}?start=invite_${inviteCode}`
        : null;
    }

    // Deduct initial liquidity + $1 oracle fee from user's wallet.
    // The oracle fee is charged on every market creation regardless of liquidity.
    const ORACLE_FEE = 1;
    const liquidityAmount = Number(initialLiquidity) || 0;
    const totalDeduction = liquidityAmount + ORACLE_FEE;

    const { balance: userBalance } = await getBalance(telegramId);
    if (userBalance < totalDeduction) {
      return {
        status: false,
        message: `Insufficient balance. You need at least $${totalDeduction} (${liquidityAmount > 0 ? `$${liquidityAmount} liquidity + ` : ""}$${ORACLE_FEE} oracle fee). You have $${userBalance.toFixed(2)}.`,
      };
    }
    await UserPublicWallet.updateOne(
      { telegramId: String(telegramId) },
      { $inc: { balance: -totalDeduction } }
    );

    const outcomeCount = outcomes.length;
    // Apply 3% house spread — binary starts 51.5/48.5, N-way tilts first outcome up
    const defaultProbs = (() => {
      const spread = 3;
      const base = parseFloat((100 / outcomeCount).toFixed(1));
      const half = parseFloat((spread / 2).toFixed(1));
      const p = Array.from({ length: outcomeCount }, () => base);
      p[0] = parseFloat((p[0] + half).toFixed(1));
      p[outcomeCount - 1] = parseFloat((p[outcomeCount - 1] - half).toFixed(1));
      const drift = parseFloat((100 - p.reduce((a, b) => a + b, 0)).toFixed(1));
      if (drift !== 0) p[outcomeCount - 1] = parseFloat((p[outcomeCount - 1] + drift).toFixed(1));
      return p;
    })();
    const market = await Market.create({
      question,
      outcomes,
      endDate: new Date(endDate),
      startDate: startDate ? new Date(startDate) : new Date(),
      isPrivate: !!isPrivate,
      oracleType: oracleType || "manual",
      creatorTelegramId: telegramId,
      marketStatus: "pending",
      active: false,
      inviteCode,
      tags: Array.isArray(tags) ? tags : [],
      liquidity: Number(initialLiquidity) || 0,
      chancePercents: Array.isArray(probabilities) && probabilities.length === outcomeCount
        ? probabilities
        : defaultProbs,
    });

    return {
      status: true,
      success: true,
      market,
      inviteCode,
      inviteLink,
    };
  } catch (error) {
    console.error("createUserMarketHandler error:", error);
    return { status: false, message: "Something went wrong" };
  }
}

/**
 * submitUMAAssertionHandler
 * Submits a real on-chain UMA OptimisticOracleV3 assertion for a market outcome.
 */
async function submitUMAAssertionHandler(data) {
  try {
    const { marketId, proposedOutcome } = data;

    if (!marketId || !proposedOutcome) {
      return { status: false, message: "marketId and proposedOutcome are required" };
    }

    const market = await Market.findById(marketId);
    if (!market) return { status: false, message: "Market not found" };
    if (market.oracleType !== "uma") {
      return { status: false, message: "Market is not UMA oracle type" };
    }
    if (market.umaStatus && market.umaStatus !== "none") {
      return { status: false, message: `Assertion already ${market.umaStatus}` };
    }

    const { submitUMAAssertion } = require("./uma.service");
    const result = await submitUMAAssertion(marketId, proposedOutcome);

    await Market.findByIdAndUpdate(marketId, {
      umaAssertionId: result.assertionId,
      umaVerdict: proposedOutcome,
      umaSubmittedAt: new Date(),
      umaChallengePeriodEnd: result.challengeEnd,
      umaStatus: "submitted",
    });

    const isTestnet = (process.env.ARB_RPC_URL || "").includes("sepolia");
    const arbiscanBase = isTestnet ? "https://sepolia.arbiscan.io" : "https://arbiscan.io";
    const arbiscanLink = `${arbiscanBase}/tx/${result.txHash}`;

    return {
      status: true,
      success: true,
      assertionId: result.assertionId,
      txHash: result.txHash,
      arbiscanLink,
      challengeEnd: result.challengeEnd,
    };
  } catch (error) {
    console.error("submitUMAAssertionHandler error:", error);
    return { status: false, message: error.message || "Something went wrong" };
  }
}

/**
 * joinPrivateMarketHandler
 * Allows a user to join a private market via its invite code.
 */
async function joinPrivateMarketHandler(data) {
  try {
    const { inviteCode, telegramId } = data;

    if (!inviteCode || !telegramId) {
      return { status: false, message: "Invite code and Telegram ID required" };
    }

    const market = await Market.findOne({ inviteCode: inviteCode.toUpperCase() }).lean();
    if (!market) return { status: false, message: "Invalid invite code" };
    if (!market.isPrivate) return { status: false, message: "Market is not private" };
    if (!market.active || market.endDate < new Date()) {
      return { status: false, message: "This market is no longer active" };
    }
    const alreadyJoined = market.allowedTelegramIds.map(String).includes(String(telegramId));

    return {
      status: true,
      success: true,
      alreadyJoined,
      message: alreadyJoined ? "Already joined this market" : "Valid invite code",
      market: {
        _id: market._id,
        question: market.question,
        description: market.description,
        outcomes: market.outcomes,
        outcomePrices: market.outcomePrices,
        chancePercents: market.chancePercents,
        endDate: market.endDate,
        liquidity: market.liquidity,
        minimumLiquidity: market.minimumLiquidity,
      },
    };
  } catch (error) {
    console.error("joinPrivateMarketHandler error:", error);
    return { status: false, message: "Something went wrong" };
  }
}

async function confirmJoinPrivateMarketHandler(data) {
  try {
    const { telegramId, marketId, outcomeIndex, outcomeLabel, amount } = data;

    if (!telegramId || !marketId || outcomeIndex === undefined || !amount) {
      return { status: false, message: "Missing required fields" };
    }

    const market = await Market.findById(marketId);
    if (!market) return { status: false, message: "Market not found" };
    if (!market.isPrivate) return { status: false, message: "Not a private market" };
    if (!market.active || market.endDate < new Date()) {
      return { status: false, message: "Market is no longer active" };
    }

    const user = await usersDB.findOne({ telegramId: String(telegramId) });
    if (!user) return { status: false, message: "User not found" };

    const feeSettings = await PlatformFeeSettings.findOne({ status: true });
    const feePercent = feeSettings ? feeSettings.feePercentage : 3;
    const platformFee = (Number(amount) * feePercent) / 100;
    const totalRequired = Number(amount) + platformFee;

    const { balance: pubBalance } = await getBalance(telegramId);
    if (pubBalance < totalRequired) {
      return {
        status: false,
        message: `Insufficient balance. You have $${pubBalance.toFixed(2)}, need $${totalRequired.toFixed(2)}`,
      };
    }

    await UserPublicWallet.updateOne(
      { telegramId: String(telegramId) },
      { $inc: { balance: -totalRequired, holdBalance: +Number(amount) } }
    );

    const odds = market.outcomePrices?.[outcomeIndex] || 0.5;
    const shares = Number(amount) / odds;

    await Prediction.create({
      userId: user._id,
      telegramId,
      groupId: null,
      chatType: "private",
      question: market.question,
      manualId: market._id,
      outcomeIndex,
      outcomeLabel: outcomeLabel || market.outcomes?.[outcomeIndex] || "",
      amount,
      odds,
      shares,
      avgPrice: odds,
      currentPrice: odds,
      potentialPayout: shares,
      potentialProfit: shares - Number(amount),
      currency: "USDC",
      deductedFrom: "userPublicWallet",
      status: "OPEN",
      source: "manual",
    });

    user.totalPredictions += 1;
    await user.save();

    // Credit market creator's fee share
    const creatorCut = market.creatorTelegramId ? platformFee * 0.25 : 0;
    if (creatorCut > 0) {
      await UserPublicWallet.updateOne(
        { telegramId: String(market.creatorTelegramId) },
        { $inc: { balance: creatorCut } },
        { upsert: true }
      );
    }

    // Add to allowedTelegramIds
    await Market.findByIdAndUpdate(marketId, {
      $addToSet: { allowedTelegramIds: telegramId },
    });

    return {
      status: true,
      success: true,
      message: "Successfully joined and placed your bet!",
    };
  } catch (error) {
    console.error("confirmJoinPrivateMarketHandler error:", error);
    return { status: false, message: "Something went wrong" };
  }
}

/**
 * disputeMarketHandler
 * Allows a user to dispute an AI-resolved market verdict.
 */
async function disputeMarketHandler(data) {
  try {
    const { marketId, telegramId, reason } = data;

    if (!marketId || !telegramId) {
      return { status: false, message: "Market ID and Telegram ID required" };
    }

    const market = await Market.findById(marketId);
    if (!market) return { status: false, message: "Market not found" };
    if (!market.aiResolution || !market.aiResolution.verdict) {
      return { status: false, message: "No AI verdict to dispute" };
    }
    if (market.disputeDeadline && new Date() > market.disputeDeadline) {
      return { status: false, message: "Dispute window has closed" };
    }
    if (market.disputeStatus !== "none") {
      return { status: false, message: "Market already disputed" };
    }

    const { callEthos } = require("./oracle.service");
    let ethosResult = null;
    try {
      ethosResult = await callEthos(marketId, market.aiResolution.verdict, reason || "");
    } catch (e) {
      console.error("Ethos call error (non-fatal):", e.message);
    }

    await Market.findByIdAndUpdate(marketId, {
      disputeStatus: "disputed",
      disputeReason: reason || null,
      disputeBy: telegramId,
    });

    return {
      status: true,
      success: true,
      message: "Dispute submitted. Human validators will review within 24h.",
      ethosResult,
    };
  } catch (error) {
    console.error("disputeMarketHandler error:", error);
    return { status: false, message: "Something went wrong" };
  }
}

async function getReferralInfoHandler(data) {
  try {
    const { telegramId } = data;
    if (!telegramId) return { status: false, message: "Telegram ID required" };

    const user = await usersDB.findOne({ telegramId });
    if (!user) return { status: false, message: "User not found" };

    const BOT_USERNAME = process.env.BOT_USERNAME || "";
    const referralLink = BOT_USERNAME
      ? `https://t.me/${BOT_USERNAME}?start=ref_${telegramId}`
      : "";

    const downlines = await Referral.find({ referrerId: telegramId })
      .select("referredUserId source totalEarned totalVolume createdAt")
      .lean();

    return {
      status: true,
      success: true,
      data: {
        referralCode: user.referralCode,
        referralLink,
        referralEarnings: user.referralEarnings || 0,
        downlineCount: downlines.length,
        downlines,
      },
    };
  } catch (error) {
    console.error("getReferralInfoHandler error:", error);
    return { status: false, message: "Something went wrong" };
  }
}

/**
 * getUserMarketsHandler
 * Returns all markets created by a given telegramId.
 */
async function getUserMarketsHandler(data) {
  try {
    const { telegramId } = data;
    if (!telegramId) return { success: false, message: "Missing telegramId" };
    const userMarkets = await Market.find({
      $or: [
        { creatorTelegramId: String(telegramId) },
        { allowedTelegramIds: telegramId, isPrivate: true },
      ],
    })
      .sort({ createdAt: -1 })
      .lean();
    return { success: true, data: userMarkets };
  } catch (error) {
    console.error("getUserMarketsHandler error:", error);
    return { success: false, message: "Something went wrong" };
  }
}

module.exports = {
  getMergedMarketsHandler,
  getCompletedBetsForUserHandler,
  getAddress,
  getUserProfileHandler,
  getUserTotalWinningsHandler,
  verifyTelegramWebAppHandler,
  verifyWalletAppHandler,
  userbetplaceHandler,
  getActiveBetsForUserHandler,
  userDepositListHandler,
  UniqueIdHandler,
  verify_UniqueIdHandler,
  usertelegramId,
  creat_new_wallet,
  disconnectWalletHandler,
  getCurrenyListHandler,
  userWithdrawHandler,
  getDappKeyHandler,
  getUniqueIdHandler,
  getMergedMarketByIdHandler,
  getHomeTodayNewsHandler,
  getUserByTelegramIdHandler,
  userBalanceHandler,
  getTelegramGroupListHandler,
  updateGroupCommissionHandler,
  send_otp,
  verify_otp,
  resend_otp,
  get_deposit_list,
  getReferralInfoHandler,
  createUserMarketHandler,
  submitUMAAssertionHandler,
  joinPrivateMarketHandler,
  confirmJoinPrivateMarketHandler,
  disputeMarketHandler,
  getUserMarketsHandler,
  getUserWithdrawList,
};
