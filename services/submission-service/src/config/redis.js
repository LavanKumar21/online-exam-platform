const IoRedis =require("ioredis")

const redisConnection=new IoRedis(process.env.REDIS_URL_PROD,{
maxRetriesPerRequest: null,
  tls: process.env.REDIS_TLS === "true" ? {} : undefined,
})

module.exports={redisConnection}
