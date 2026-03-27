const { examSubmissionQueue } = require("../queues/submissionQueue");


const sheduleExamSubmissionJob = async (examId,studentId,answers) => {

    const jobId = `exam-${examId}-student-${studentId}`;
    try {
    await examSubmissionQueue.add(
      "SUBMIT_EXAM",
      {
        submissions: [{ examId, studentId, answers }],
      },
      {
        jobId,
        attempts: 3, // retry if failed
        backoff: { type: "exponential", delay: 5000 }, // retry delay
      }
    );

    console.log(`✅ Submission queued for exam ${examId}, student ${studentId}`);
    return { success: true, message: "Submission queued successfully" };
  }
  catch (error) {
    console.error(
      `❌ Failed to queue submission for exam ${examId}, student ${studentId}:`,
      error
    );
    return { success: false, message: "Failed to queue submission" };
  }

}

module.exports={sheduleExamSubmissionJob}