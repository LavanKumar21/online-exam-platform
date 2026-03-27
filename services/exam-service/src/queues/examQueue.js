const {Queue}=require("bullmq")
const { redisConnection } = require("../config/redis")



const examQueue = new Queue("examQueue", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,          // retry 3 times
    backoff: {
      type: "exponential",
      delay: 5000,        // 5 sec
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

module.exports={examQueue}