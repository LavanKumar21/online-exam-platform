require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { connectDB } = require("../../results-service/src/config/db");
const ExamSubmission = require("./models/submission_exam");
const submissionExamRoute = require("./routes/submission_route");

const app=express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

(async () => {
    try {
        await connectDB();
        ExamSubmission.init();
    } catch (error) {
        console.log("failed to inilized the tables",error)
        process.exit(1)
    }
})();



app.get("/submission/health",(req,res)=>{
    res.json({status:"Submission Service is running" }); 
});

app.use("/submission",submissionExamRoute)

const PORT=process.env.PORT || 4004

app.listen(PORT ,()=>{
console.log(`Submission Service is running on port ${PORT}`);
})


