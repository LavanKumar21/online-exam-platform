const express=require("express");
const { authMiddleware } = require("../middleware/examAuthMiddleware");
const { authorizedRoles } = require("../middleware/roleMiddleware");
const { createExamController, getexamByIdController, updateExamByIdController, deleteExamByIdController, getAllExamsByAdminController, addQuestionsToExamController, getAllQuestionsOfExamController, getAllQuestionsOfExamForStudentController, deleteQuestionFromExamController, updateQuestionInExamController, getAllExamsController,  liveExamController, endExamController } = require("../controllers/examController");

const examRouter=express.Router();

// Route to create a new exam
examRouter.post("/create-exam",authMiddleware,authorizedRoles("admin"),createExamController)

// Route to get exam by ID
examRouter.get("/exam/:examId",authMiddleware,authorizedRoles("admin","student"),getexamByIdController);

// Route to update exam by ID
examRouter.patch("/exam/:examId",authMiddleware,authorizedRoles("admin"),updateExamByIdController)

// Route to delete Exam by ID
examRouter.delete("/exam/:examId",authMiddleware,authorizedRoles("admin"),deleteExamByIdController)

// Route to get all exam by specific admin 

examRouter.get("/admin/exams",authMiddleware,authorizedRoles("admin"),getAllExamsByAdminController)

//! Route to update the exam live (ongoing) by ID
examRouter.patch("/exam/live/:examId/",authMiddleware,authorizedRoles("admin"),liveExamController)

//! Route to update the exam end (completed) by ID 
examRouter.patch("/exam/end/:examId/",authMiddleware,authorizedRoles("admin"),endExamController)

// Route to add questions to an exam
examRouter.post("/exam/:examId/add-questions",authMiddleware,authorizedRoles("admin"),addQuestionsToExamController)

// Route to get all questions of an exam for admin

examRouter.get("/exam/:examId/questions",authMiddleware,authorizedRoles("admin"),getAllQuestionsOfExamController)
 
// Route to get all questions of an exam for student

examRouter.get("/exam/:examId/student/questions",authMiddleware,authorizedRoles("student"),getAllQuestionsOfExamForStudentController)

// Route to delete a question from an exam

examRouter.delete("/exam/:examId/question/:questionId",authMiddleware,authorizedRoles("admin"),deleteQuestionFromExamController)


// Route to update a question in an exam
examRouter.patch("/exam/:examId/question/:questionId",authMiddleware,authorizedRoles("admin"),updateQuestionInExamController)


// Route to fetch all exams from all admin for students

examRouter.get("/all-exams",authMiddleware,authorizedRoles("student"),getAllExamsController)


module.exports=examRouter;