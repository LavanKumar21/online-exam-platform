// ✅ submission queue

const { Queue } = require("bullmq");
const { redisConnection } = require("../config/redis");

// Create queue
const examSubmissionQueue  = new Queue("examSubmissionQueue", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3, // retry 3 times if failed
    backoff: {
      type: "exponential",
      delay: 5000, // retry after 5 sec, then increase
    },
    removeOnComplete: true, // clean completed jobs
    removeOnFail: false,    // keep failed jobs for debugging
  },
});

module.exports = { examSubmissionQueue };