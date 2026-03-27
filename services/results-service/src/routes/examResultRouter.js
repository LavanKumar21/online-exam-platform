const express=require("express");
const { authMiddleware } = require("../middleware/examResultMiddleware");
const { authorization } = require("../middleware/roleMiddleware");
const { getExamResults, calculateResultscontroller, getStudentExamResults } = require("../controllers/resultsController");

const examResultRouter=express.Router();



// Router to get all students result for a specific exam
examResultRouter.get("/exam/:examId",authMiddleware,authorization("admin"),getExamResults)
examResultRouter.post("/calculate/:examId",authMiddleware,authorization("admin"),calculateResultscontroller)
examResultRouter.get("/result/:examId",authMiddleware,authorization("student"),getStudentExamResults)



module.exports=examResultRouter;