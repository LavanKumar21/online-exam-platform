const ExamResultsModel = require("../models/exam_results_model");

const getExamResults=async (req,res) => {
    // Implementation for fetching exam results

    try {
        const {examId}=req.params;
         if (!examId) {
      return res.status(400).json({
        success: false,
        message: "Exam ID is required",
      });
    }

    const results= await ExamResultsModel.getExamResultsByExamId(examId);
    return res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });

    } catch (error) {
        console.error("❌ Fetch exam results failed", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch exam results",
    });
    }
}


const calculateResultscontroller=async (req,res) => {
    // Implementation for calculating exam results
    const {examId}=req.params;
    try {
        if (!examId) {
      return res.status(400).json({
        success: false,
        message: "Exam ID is required",
      }); 
    }
      const results=await ExamResultsModel.calculateExamResultsByExamId(examId)

      const insertRes=await ExamResultsModel.insertExamResults(examId,results)
      console.log(insertRes)
      return res.status(200).json({
        success: true,
        message: "Exam results calculated and stored successfully",
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to calculate exam results",
      }); 
    }
    
}


const getStudentExamResults=async (req,res) => {
  const {userId}=req.user 
  const {examId}=req.params;
  try {
    const results= await ExamResultsModel.getStudentExamResults(examId,userId)
    return res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: "Failed to fetch student exam results",
    });
  }
  
}

module.exports={getExamResults,calculateResultscontroller,getStudentExamResults}