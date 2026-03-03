const Redis = require("ioredis");
const { subscribeNewToken } = require("./services/clobWs");

const redisSub = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: 6379,
});

redisSub.subscribe("POLY_NEW_TOKEN");

redisSub.on("message", (channel, message) => {
  if (channel === "POLY_NEW_TOKEN") {
    const { tokenId } = JSON.parse(message);
    console.log("📡 Redis token:", tokenId);
    subscribeNewToken(tokenId);
  }
});
