const { examQueue } = require("../queues/examQueue");


const scheduleExamJobs =async (exam) => {
    
    const now=Date.now();
    const startDelay=new Date(exam.scheduled_datetime).getTime()-now;
    const endDelay=new Date(exam.scheduled_datetime).getTime()+exam.duration*60000-now;

    await examQueue.add("START_EXAM",{examId:exam.id},{delay:Math.max(startDelay,0)});
    await examQueue.add("END_EXAM", { examId: exam.id }, { delay: Math.max(endDelay, 0) });
}

module.exports={scheduleExamJobs}