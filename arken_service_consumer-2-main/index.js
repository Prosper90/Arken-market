require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectRabbit } = require('./rabbit');
const { startAuthConsumer } = require('./consumers/auth.consumer');
const key = require("./config/key");
const { startPolymarketWS } = require("./services/clobWs");
var AdminWallet = require("./models/adminWallet");
var adminDB = require("./models/admin");
var Market = require("./models/markets");
var common = require("./utils/common");

const http = require("http");
let server = "";
const fs = require("fs");
const https = require("https");
const { initSocket } = require("./socket");


const app = express();
const connectDB = require("./config/db");
require('./cron')
connectDB();
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

startPolymarketWS()
var corsPath = {
  origin: function (origin, callback) {
    try {
      if (origin !== "undefined") {
        if (key.WHITELISTURL.indexOf(origin) > -1) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      } else {
      }
    } catch (error) {
      console.log(error, "cors Error");
    }
  },
};


app.use(cors(corsPath));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "arken-consumer-2", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3003;

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

initSocket(server);
require('./redisSubscriber'); // listens for DEPOSIT_CONFIRMED and emits to socket rooms

async function createAdminWalletIfNotExists(adminUserId) {
  let wallet = await AdminWallet.findOne({ userId: adminUserId });

  if (!wallet) {
    wallet = await AdminWallet.create({
      userId: adminUserId,
      wallets: [],
      spot_wallet: 0,
      status: "ACTIVE",
      type: 0, // main wallet
    });

    console.log("Admin wallet created:", wallet._id);
  }

  return wallet;
}

// async function ensureWalletCurrencies() {
//   const wallets = await AdminWallet.find({});

//   for (const wallet of wallets) {
//     if (!Array.isArray(wallet.wallets)) {
//       wallet.wallets = [];
//     }

//     const symbols = wallet.wallets.map(w => w.currencySymbol);

//     const requiredCurrencies = [
//       { currencyName: "Tether", currencySymbol: "USDT" },
//       { currencyName: "Solana", currencySymbol: "SOL" },
//       { currencyName: "Arbitrum", currencySymbol: "ARB" },
//     ];

//     let updated = false;

//     for (const currency of requiredCurrencies) {
//       if (!symbols.includes(currency.currencySymbol)) {
//         wallet.wallets.push({
//           currencyName: currency.currencyName,
//           currencySymbol: currency.currencySymbol,
//           amount: 0,
//           holdAmount: 0,
//         });
//         updated = true;
//       }
//     }

//     if (updated) {
//       await wallet.save();
//       console.log(`Updated admin wallet: ${wallet._id}`);
//     }
//   }
// console.log(wallets,'wallets====')
//   console.log("All admin wallets ensured with USDT, SOL, ARB");
// }


// ensureWalletCurrencies()



async function seedAdmin() {
  try {
    const existing = await adminDB.findOne({});
    if (existing) {
      console.log("✅ Admin already exists — skipping seed");
      return;
    }

    const email = process.env.ADMIN_SEED_EMAIL || "admin@arkenmarket.com";
    const password = process.env.ADMIN_SEED_PASSWORD || "Arken@@543";

    await adminDB.create({
      email: common.encrypt(email),
      password: common.encrypt(password),
      status: "active",
      tfa_status: 0,
      type: 0,
    });

    console.log(`✅ Admin seeded — email: ${email}`);
  } catch (err) {
    console.error("❌ Admin seed failed:", err.message);
  }
}

async function seedMarkets() {
  try {
    const count = await Market.countDocuments();
    if (count > 0) {
      console.log("✅ Markets already exist — skipping seed");
      return;
    }

    const seeds = [
      {
        question: "Will Bitcoin reach $150,000 by end of 2025?",
        category: "Crypto",
        oracleType: "manual",
        outcomes: ["Yes", "No"],
        outcomePrices: [0.55, 0.45],
        chancePercents: [55, 45],
        endDate: new Date("2025-12-31"),
        liquidity: 1000,
        marketStatus: "active",
        active: true,
      },
      {
        question: "Will Solana reach $500 by end of 2025?",
        category: "Crypto",
        oracleType: "manual",
        outcomes: ["Yes", "No"],
        outcomePrices: [0.40, 0.60],
        chancePercents: [40, 60],
        endDate: new Date("2025-12-31"),
        liquidity: 500,
        marketStatus: "active",
        active: true,
      },
    ];

    await Market.insertMany(seeds);
    console.log("✅ Markets seeded");
  } catch (err) {
    console.error("❌ Market seed failed:", err.message);
  }
}

async function connectRabbitWithRetry(attempt = 1) {
  try {
    await connectRabbit(startAuthConsumer);
    console.log(' Connected to RabbitMQ');
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

    await seedAdmin();
    await seedMarkets();

    startAuthConsumer();

    server.listen(PORT, () => {
      console.log(` Auth Consumer Service running on port ${PORT}`);
    });

  } catch (err) {
    console.error(' Failed to start Auth Consumer Service:', err);
    process.exit(1);
  }
}

startService();
