const { Queue } = require("bullmq");
const { redisConnection } = require("../config/redis");

const examSubmissionQueue = new Queue("examSubmissionQueue", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,       // retry failed jobs 3 times
    removeOnComplete: true, // remove jobs from Redis after completion
    removeOnFail: false,    // keep failed jobs for debugging
  },
});

module.exports = { examSubmissionQueue };