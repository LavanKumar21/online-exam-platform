//  ✅ START / END exam 

const { Worker} = require("bullmq");
const { redisConnection } = require("../config/redis");
const ExamModel = require("../models/examModel");

const QUEUE_NAME = "examQueue";




const examWorker = new Worker(
  QUEUE_NAME,
  async (job) => {
    const { examId } = job.data;

    if (!examId) throw new Error("examId is missing");

    if (job.name === "START_EXAM") {
      await ExamModel.updateExamStatusById(examId, "ongoing");
      console.log(`✅ Exam ${examId} started`);
    } else if (job.name === "END_EXAM") {
      await ExamModel.updateExamStatusById(examId, "completed");
      console.log(`✅ Exam ${examId} ended`);
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
    autorun: true,
  }
);

examWorker.on("completed", (job) =>
  console.log(`✅ Job ${job.id} (${job.name}) completed`)
);
examWorker.on("failed", (job, err) =>
  console.error(`❌ Job ${job.id} (${job.name}) failed:`, err.message)
);

module.exports=examWorker