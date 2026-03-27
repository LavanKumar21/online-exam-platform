// ✅ Redis connection

const IORedis = require("ioredis");

const redisConnection = new IORedis(process.env.REDIS_URL_PROD, {
  maxRetriesPerRequest: null,
  tls: process.env.REDIS_TLS === "true" ? {} : undefined,
});

// ✅ Connection logs (important for debugging)
redisConnection.on("connect", () => {
  console.log("✅ Redis connected");
});

redisConnection.on("ready", () => {
  console.log("🚀 Redis ready");
});

redisConnection.on("error", (err) => {
  console.error("❌ Redis error:", err);
});

redisConnection.on("reconnecting", () => {
  console.log("🔄 Redis reconnecting...");
});

module.exports = { redisConnection };

