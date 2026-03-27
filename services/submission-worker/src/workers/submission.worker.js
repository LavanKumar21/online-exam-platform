//  ✅ process submissions
// workers/examSubmissionWorker.js
const { Worker } = require("bullmq");
const { redisConnection } = require("../config/redis");
const ExamSubmissionModel = require("../models/examSubmissionModel");

const examSubmissionWorker = new Worker(
  "examSubmissionQueue",
  async (job) => {
    const submissions = job.data.submissions; // array of {examId, studentId, answers}

    for (const submission of submissions) {
      const { examId, studentId, answers } = submission;

      if (answers.length > 0) {
        // bulk insert using your model
        await ExamSubmissionModel.submitExam(examId, studentId, answers);
      }
    }

    console.log(`✅ Processed ${submissions.length} submission(s)`);
  },
  {
    connection: redisConnection,
    concurrency: 3, // adjust based on DB capacity
    autorun: true,
  }
);

examSubmissionWorker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

examSubmissionWorker.on("failed", (job, err) => {
  console.error(`❌ Job ${job.id} failed:`, err.message);
});

console.log("🟢 Exam Submission Worker running on Render");
module.exports = examSubmissionWorker;