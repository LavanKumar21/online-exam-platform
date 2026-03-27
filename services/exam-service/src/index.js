require('dotenv').config();
const express=require("express");
const cors=require("cors");
const cookieParser=require('cookie-parser');
const examRouter = require("./routes/examRouter");
const { connectDB } = require("./config/db");
const ExamModel = require("./models/examModel");
// const { examQueue } = require('./queues/examQueue');
const QuestionModel = require('./models/questionModel');
const ExamQuestionModel = require('./models/examquestionModel');
const OptionModel = require('./models/question_optionsModel');
const { redisConnection } = require('./config/redis');
const PORT=process.env.PORT || 4002


const app=express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());


(async ()=>{
    try {
        // Connect to the database
        await connectDB();

        // Initialize the Exam table
        await ExamModel.init();
        await QuestionModel.init()
        await ExamQuestionModel.init()
        await OptionModel.init()
        console.log("✅ Exam table ready");

       
    } catch (error) {
        console.error("❌ Failed to connect to the database or initialize Exam table", error);
        process.exit(1);
    }
})();


app.use("/exams",examRouter)


// Health check endpoint
app.get("/health",(req,res)=>{
    res.json({status:"Exam Service is running" });
})

// Import and start the exam scheduler worker
// require("./workers/examScheduler.worker");

redisConnection.on("connect", () => {
  console.log("✅ Redis connected successfully");
});
redisConnection.on("ready", () => {
  console.log("🚀 Redis is ready to use");
});

redisConnection.on("error", (err) => {
  console.error("❌ Redis connection error:", err);
});



 // Start the server after initializing the database
    app.listen(PORT, () => {
        console.log(`Exam Service is running on port ${PORT}`);
    }); 
        


