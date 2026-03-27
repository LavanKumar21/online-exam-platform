require("dotenv").config();
const express=require("express");
const cors=require("cors");
const cookieParser=require("cookie-parser");
const { connectDB } = require("./config/db");
const ExamResultsModel = require("./models/exam_results_model");
const examResultRouter = require("./routes/examResultRouter");
const PORT=process.env.PORT || 4003


const app=express();

app.use(cors());

app.use(express.json());
app.use(cookieParser());

(async () => {
    try {
        await connectDB();

        ExamResultsModel.init()
    } catch (error) {
        console.log("failed to inilized the tables",error)
        process.exit(1)
    }
})();


app.use("/results",examResultRouter);

app.get("/health",(req,res)=>{
    res.json({status:"Exam Results Service is running" });
});

app.listen(PORT,()=>{
     console.log(`Exam Results Service is running on port ${PORT}`);
});