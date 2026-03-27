const express=require("express");
const { authMiddleware, authorizedRoles } = require("../middleware/authmiddleware");
const { submissionController } = require("../controllers/submission_controller");

const submissionExamRoute=express.Router()

//! Route to submit the exam by students
submissionExamRoute.post("/exam/:examId/submit",authMiddleware,authorizedRoles("student"),submissionController);


module.exports=submissionExamRoute