const ExamModel = require("../models/examModel");
const ExamSubmission = require("../models/submission_exam");
const { sheduleExamSubmissionJob } = require("../redisServices/examsubmission.services");


const submissionController=async (req,res) => {
    
    const { examId } = req.params;
    const {userId} = req.user; 
    const {answers} = req.body;

    console.log(userId)
     try {
        if (!examId) {
      return res.status(400).json({
        success: false,
        message: "Exam ID is required"
      });
    }

    //! check if exam is ongoing and within submission window
    const currentExam= await ExamModel.getExamById(examId)

    if(currentExam.status!=="ongoing"){
        return res.status(400).json({
            success:false,
            message:"Exam is not currently ongoing. Failed to submit."
        })
    }
     if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Answers are required"
      });
    }
      await sheduleExamSubmissionJob(examId, userId,answers)
        return res.status(200).json({
            success: true,
            message: "Exam submitted successfully"
    });

     } catch (error) {
        console.error("Submit exam error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
     }
}

module.exports={submissionController}