const WebSocket = require("ws");
const Prediction = require("../models/predictions");
const { getIO } = require("../socket");

const WS_URL = "wss://ws-subscriptions-clob.polymarket.com/ws/market";

let ws;
let subscribedTokenIds = new Set();

function startPolymarketWS() {
  ws = new WebSocket(WS_URL, {
    headers: {
      Origin: "https://polymarket.com"
    }
  });

  setInterval(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send("PING");
    }
  }, 10000);

  ws.on("open", async () => {
    console.log("✅ Connected to Polymarket MARKET WS");

    try {
      const tokenIds = await Prediction.find({
        source: "poly",
        status: "OPEN",
        tokenId: { $ne: null }
      }).distinct("tokenId");

      if (!tokenIds.length) return;

      tokenIds.forEach(id => subscribedTokenIds.add(id));

      ws.send(JSON.stringify({ type: "market", assets_ids: tokenIds }));
    } catch (err) {
      console.error("❌ Failed to subscribe to Polymarket tokens:", err.message);
    }
  });


  ws.on("message", async (msg) => {
    try {
      const raw = msg.toString();

      console.log(" RAW WS MESSAGE1:", raw);




      //  io.emit("pnl_update", {
      //   predictionId: "695e1c4496a12d9464f4075f",
      //   tokenId: "43339071589891970847677388273089840867041925606339871719665778466450801432127",
      //   currentPrice: 0.42,
      //   pnl: 12.34
      // });


      if (raw === "PONG") return;

      const data = JSON.parse(raw);

      if (!data.price_changes || !Array.isArray(data.price_changes)) return;
      console.log("📩 RAW WS MESSAGE2345:", data.price_changes);

       const io = getIO();

      console.log("📩 RAW WS MESSAGE3345:", data);


      // for (const change of data.price_changes) {
      //   const assetId = change.asset_id;
      //   const bestBid = Number(change.best_bid);
      //   const bestAsk = Number(change.best_ask);
      //   if (!bestBid || !bestAsk) continue;

      //   const currentPrice = (bestBid + bestAsk) / 2;

      //   const bets = await Prediction.find({
      //     tokenId: assetId,
      //     status: "OPEN"
      //   });

      //   for (const bet of bets) {
      //     const currentValue = bet.shares * currentPrice;
      //     const pnl = currentValue - bet.amount;

      //     bet.currentPrice = currentPrice;
      //     bet.unrealizedPnl = pnl;
      //     await bet.save();

      //     io.to(bet.telegramId.toString()).emit("pnl_update", {
      //       predictionId: bet._id,
      //       tokenId: bet.tokenId,
      //       currentPrice,
      //       pnl
      //     });
      //   }
      // }

      for (const change of data.price_changes) {
  const assetId = change.asset_id;
  const bestBid = Number(change.best_bid);
  const bestAsk = Number(change.best_ask);

  console.log("WS assetId:", assetId);
  console.log("bestBid / bestAsk:", bestBid, bestAsk);

  const bets = await Prediction.find({ tokenId: assetId });

  console.log("Matched bets:", bets.length);

  if (!bets.length) continue;

  const currentPrice = (bestBid + bestAsk) / 2;

  for (const bet of bets) {
    bet.currentPrice = currentPrice;
    bet.unrealizedPnl = bet.shares * currentPrice - bet.amount;
    await bet.save();

    // console.log("Updated bet:", bet._id);
    // console.log("Updated bet:", bet.unrealizedPnl);
    // console.log("Updated bet:", bet.currentPrice);


    io.emit("pnl_update", {
  telegramId: bet.telegramId,
  predictionId: bet._id,
  tokenId: bet.tokenId,
  currentPrice: bet.currentPrice,
  pnl: bet.unrealizedPnl
});

   
//     io.to(bet.telegramId.toString()).emit("pnl_update", {
//   predictionId: bet._id,
//   tokenId: bet.tokenId,
//   currentPrice,
//   pnl: bet.unrealizedPnl
// });
    // console.log("Updated bet success:");

  }
}

    } catch (err) {
      console.error("WS message error:", err.message);
    }
  });

  ws.on("close", () => {
    console.log("❌ WS closed – reconnecting...");
    setTimeout(startPolymarketWS, 3000);
  });

  ws.on("error", (err) => {
    console.error("WS error:", err.message);
    ws.close();
  });
}

function subscribeNewToken(tokenId) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  if (subscribedTokenIds.has(tokenId)) return;

  subscribedTokenIds.add(tokenId);

  ws.send(JSON.stringify({
    operation: "subscribe",
    assets_ids: [tokenId]
  }));

  console.log("➕ Subscribed token:", tokenId);
}

module.exports = { startPolymarketWS, subscribeNewToken };
