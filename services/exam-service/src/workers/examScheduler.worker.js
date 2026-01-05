const { Worker } = require("bullmq");
const ExamModel = require("../models/examModel");
const { redisConnection } = require("../config/redis");

const examWorker=new Worker("examQueue",async (job) => {
    const {examId}=job.data
    if(job.name==="START_EXAM"){
        await ExamModel.updateExamStatusById(examId,"ongoing");
        console.log(`Exam ${examId} has started.`);
    }
    else if(job.name==="END_EXAM"){
        await ExamModel.updateExamStatusById(examId,"completed");
        console.log(`Exam ${examId} has ended.`);
    }
   
},
{
    connection:redisConnection
}
);

examWorker.on("completed",(job)=>{
    console.log(`Job ${job.id} completed`)
})

examWorker.on("failed",(job,err)=>{
    console.error(`Job ${job.id} failed with error ${err.message}`)
})

module.exports={examWorker}