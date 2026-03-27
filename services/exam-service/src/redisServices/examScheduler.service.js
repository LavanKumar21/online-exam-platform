const { examQueue } = require("../queues/examQueue");


const scheduleExamJobs =async (exam) => {
    
    const now=Date.now();
  const startTime = new Date(exam.scheduled_datetime).getTime();
  const endTime = startTime + exam.duration * 60000;

  const startDelay = startTime - now;
  const endDelay = endTime - now;

    await examQueue.add("START_EXAM",{examId:exam.id},{delay:Math.max(startDelay,0)});
    await examQueue.add("END_EXAM", { examId: exam.id }, { delay: Math.max(endDelay, 0) });
}

module.exports={scheduleExamJobs}