import WebSocket from "ws";
// import Polymarket from "../models/Polymarket.js";
// import Position from "../models/Position.js";

export const startRTDS = () => {
  const ws = new WebSocket("wss://ws-live-data.polymarket.com");

  ws.on("open", () => console.log("Connected to RTDS WS"));

  ws.on("message", async (msg) => {
    const data = JSON.parse(msg);

    if (data.event === "price_update") {
      const market = await Polymarket.findOne({ specifyId: data.marketId });
      if (!market) return;

      market.outcomePrices = data.outcomePrices;
      await market.save();

      // Update positions for PnL
      const positions = await Position.find({ marketId: data.marketId, open: true });
      for (let pos of positions) {
        const idx = market.outcomes.indexOf(pos.outcome);
        const price = data.outcomePrices[idx] || 0;
        pos.currentPrice = price;
        pos.pnl = (price - pos.avgPrice) * pos.shares;
        await pos.save();
      }
    }
  });

  ws.on("close", () => console.log("RTDS WS closed"));
  ws.on("error", (err) => console.error("RTDS WS error:", err));
};
