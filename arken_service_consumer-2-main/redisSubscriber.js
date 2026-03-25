const Redis = require("ioredis");
const { subscribeNewToken } = require("./services/clobWs");
const { getIO } = require("./socket");

const redisSub = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: 6379,
});

redisSub.subscribe("POLY_NEW_TOKEN", "DEPOSIT_CONFIRMED");

redisSub.on("message", (channel, message) => {
  if (channel === "POLY_NEW_TOKEN") {
    const { tokenId } = JSON.parse(message);
    console.log("📡 Redis token:", tokenId);
    subscribeNewToken(tokenId);
  }

  if (channel === "DEPOSIT_CONFIRMED") {
    try {
      const payload = JSON.parse(message);
      const io = getIO();
      io.to(String(payload.telegramId)).emit("deposit_confirmed", payload);
      console.log(`📡 Deposit confirmed emitted to user ${payload.telegramId}: ${payload.amount} ${payload.currencySymbol}`);
    } catch (err) {
      console.error("DEPOSIT_CONFIRMED emit error:", err.message);
    }
  }
});
