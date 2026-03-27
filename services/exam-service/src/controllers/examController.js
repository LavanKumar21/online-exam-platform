const { pool } = require("../config/db");
const { redisConnection } = require("../config/redis");
const ExamModel = require("../models/examModel");
const ExamQuestionModel = require("../models/examquestionModel");
const OptionModel = require("../models/question_optionsModel");
const QuestionModel = require("../models/questionModel");
const { scheduleExamJobs } = require("../redisServices/examScheduler.service");
const {v4 :uuidv4} =require("uuid")
// Controller to create a new exam
const createExamController=async(req,res)=>{


    try {
         const {title,description,category,duration,total_marks,passing_marks,total_questions,scheduled_datetime}=req.body;
         const adminId=req.user.userId;
         console.log(adminId)
         // validate input
            if(!title || !duration || !total_marks || !passing_marks  || !total_questions || !scheduled_datetime  || !category || !description){
                return res.status(400).json({message:"All fields are required",sucess:false});
            }

            const examData={
                title,
                description,
                category,
                duration,
                total_marks,
                passing_marks,
                total_questions,
                scheduled_datetime,
                created_by:adminId,
                status:"scheduled",
            }
            // console.log(examData)
            // save the exam
            const newExam=await ExamModel.createExam(examData);

            // schedule exam jobs
            await scheduleExamJobs(newExam)
            
            res.status(201).json({exam:newExam,message:"Exam created successfully",sucess:true});

    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"Internal server error in create exam",sucess:false});
    }
}

// Controller to get exam by ID

const getexamByIdController=async(req,res)=>{
    try {
        const {examId}=req.params
        const exam= await ExamModel.getExamById(examId);

        if(!exam) return res.status(404).json({message:"Exam not found",success:false});

        return res.status(200).json({exam,sucess:true})
    } catch (error) {
        return res.status(500).json({message:"Internal server error in get exam by ID",success:false})
    }
}

// Controller to update exam by ID

const updateExamByIdController=async(req,res)=>{
    try {
        const {examId}=req.params;
         const {title,description,category,duration,total_marks,passing_marks,total_questions,scheduled_datetime}=req.body;
         const adminId=req.user.userId;
        // find the exam
        const exam=await ExamModel.getExamById(examId)
        if(!exam) return res.status(404).json({message:"Exam not found",success:false});
        // validate input
        if(!title || !duration || !total_marks || !passing_marks || !total_questions || !scheduled_datetime || !category || !description){
            return res.status(400).json({message:"All fields are required",success:false});
        }

        const updateData={
            title,
            description,
            category,
            duration,
            total_marks,
            passing_marks,
            total_questions,
            scheduled_datetime
        };

        const updatedExam= await ExamModel.updateExamById(examId,adminId,updateData)
        return res.status(200).json({exam:updatedExam,message:"Exam updated successfully",success:true});
    } catch (error) {
        return res.status(500).json({message:"Internal server error in update exam by ID",success:false});
    }
}

// Controller to delete exam by ID

const deleteExamByIdController=async(req,res)=>{
    try {
        const {examId}=req.params;
        const adminId=req.user.userId;
        // find the exam
        const exam= await ExamModel.getExamById(examId);
        if(!exam || exam.is_deleted ) return res.status(404).json({message:"Exam not found",success:false});

        // check the admin ownership
        if(exam.created_by !== adminId) return res.status(403).json({message:"You are not authorized to delete this exam",success:false})
        // soft delete the Exam
        const deleteExam=await ExamModel.deleteExamById(examId,adminId);
        if(!deleteExam) return res.status(400).json({message:"Unable to delete the exam (maybe already deleted)",success:false})

        return res.status(200).json({message:"Exam deleted successfully",success:true,deletedAt:deleteExam.deleted_at});
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"Internal Server Error while deleting Exam" ,sucess:false})
    }
}

// Controller to get all exams by specific admin

const getAllExamsByAdminController=async(req,res)=>{
    try {
        const adminId=req.user.userId;
        const exams=await ExamModel.getAllExamsByAdmin(adminId);
        console.log(exams)
        if(!exams || exams.length===0) return res.status(404).json({message:"No exams found for this admin",success:false});
        return res.status(200).json({exams,success:true});
    } catch (error) {
        return res.status(500).json({message:"Internal server error in get all exams by admin",success:false});
    }
}

// controller to get all exams from all admin for students

const getAllExamsController=async (req,res) => {
    try {
        const exams= await ExamModel.getAllExams();
        // console.log(exams)
        if(!exams || exams.length ===0){
            return res.status(404).json({message:"No exams found",success:false});
        }
        return res.status(200).json({exams,success:true});
        
    } catch (error) {
        return res.status(500).json({message:"Internal server error in get all exams for students",success:false});
    }
    
}

// add questions to particular exam 

const addQuestionsToExamController=async (req,res) => {
        try {
            const { examId } = req.params;
            const { questions } = req.body;
            const adminId = req.user.userId;

            if(!questions || !Array.isArray(questions) || questions.length === 0) {
                return res.status(400).json({ message: "Questions array is required", success: false });
            }
            await pool.query("BEGIN");

            // Verify exam exists and belongs to admin
            const exam= await ExamModel.getExamByAdminAndExamID(examId,adminId);

            if(!exam){
                await pool.query("ROLLBACK");
                return res.status(404).json({ message: "Exam not found ", success: false });
            }

            if(exam.created_by !== adminId){
                await pool.query("ROLLBACK");
                return res.status(403).json({success: false,message: "You are not authorized to add questions to this exam"});
            }
            if(exam.status === "completed" || exam.status ==="ongoing"){
                await pool.query("ROLLBACK");
                return res.status(400).json({ success: false, message: "Cannot add questions to a completed exam" }); 
            }

            // validate total questions

            if(questions.length !== exam.total_questions){
                await pool.query("ROLLBACK");
                return res.status(400).json({ message: `Expected ${exam.total_questions} questions but received ${questions.length}`, success: false });
            }

            const countExistingQuestions= await ExamQuestionModel.countByExamId(examId)

            if(countExistingQuestions.count >0 ){
                await pool.query("ROLLBACK");
                return res.status(400).json({
                    success: false,
                    message: "Questions already added for this exam"
                });
            }

            // Insert questions and link to exam

            for(let i=0;i<questions.length;i++){

                const q=questions[i];

                const questionID=uuidv4();

                const questionData={
                    id:questionID,
                    question_text: q.question_text,
                    difficulty: q.difficulty,
                    marks: q.marks,
                    created_by: adminId
                }
                // Insert question
                const OneQuestion= await QuestionModel.insertQuestion(questionData);

                // Insert options for the question
                 for(const opt of q.options){
                    const EachOptionData={
                            question_id: questionID,
                            option_text: opt.option_text,
                            is_correct: opt.is_correct
                    }
                    await OptionModel.insertOption(EachOptionData)
                 }

                // Link question to exam

                const examQuestionData={
                    exam_id: examId,
                    question_id: questionID,
                    question_order: i + 1
                }

                const linkedExamQuestion= await ExamQuestionModel.insertExamQuestion(examQuestionData);


            }

            // Commit transaction

            await pool.query("COMMIT");

            return  res.status(201).json({ message: "Questions added to exam successfully", success: true });

        } catch (error) {
            await pool.query('ROLLBACK');
            console.error("Error adding questions to exam:", error);
            return res.status(500).json({ message: "Internal server error while adding questions to exam", success: false });
        } 
    }

// get all questions of an exam controller

const getAllQuestionsOfExamController=async(req,res)=>{

    try {
        const {examId}=req.params
        const questions= await ExamQuestionModel.getQusetionsByExamId(examId);

        // if no questions found
        if (questions.length === 0) {
        return res.status(404).json({
        success: false,
        message: "No questions found for this exam"
      });
    }
    // Transform the flat list into a structured format
    const exam={
        exam_id: questions[0].exam_id,
        title: questions[0].title,
        duration: questions[0].duration,
        total_questions: questions[0].total_questions,
        questions: []       
    }
    const questionMap = new Map();
    questions.forEach(row=>{
         if (!questionMap.has(row.question_id)) {
        questionMap.set(row.question_id, {
          question_id: row.question_id,
          question_text: row.question_text,
          difficulty: row.difficulty,
          marks: row.marks,
          order: row.question_order,
          options: []
        });
        exam.questions.push(questionMap.get(row.question_id));
      }
      questionMap.get(row.question_id).options.push({
        option_id: row.option_id,
        option_text: row.option_text
      });
    })

    return res.status(200).json({
      success: true,
      data: exam
    });

    } catch (error) {
    console.error("Fetch Exam Questions Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch exam questions"
    });
    }
}


// get all questions of an exam for student 

const getAllQuestionsOfExamForStudentController=async(req,res)=>{
    try {
        const{examId}=req.params
        const now=new Date();
        const exam=await ExamModel.getExamById(examId);
        // console.log(exam)

        if(!exam) return res.status(404).json({message:"Exam not found",success:false});

        const startingTime=new Date(exam.scheduled_datetime)
        const endingTime=new Date(startingTime.getTime()+ exam.duration * 60000);

        if(now <startingTime){
            return res.status(403).json({message:"Exam has not started yet",success:false});
        }

        const redisKey=`exam:live:questions:${examId}`;

        const cachedData= await redisConnection.get(redisKey);

        // if cached data found return from redis

        if(cachedData){
            return res.status(200).json({success:true,data:JSON.parse(cachedData)});
        }

        // if no cached data found fetch from db

        const Allquestions= await ExamQuestionModel.getQusetionsByExamId(examId)

        if(Allquestions.length ===0){
            return res.status(404).json({message:"No questions found for this exam",success:false});
        }

        // Transform the flat list into a structured format
      function formatExamData(questions){
           const examData={
            exam_id: exam.exam_id,
            title: exam.title,
            duration: exam.duration,
            questions:[]
        }
         const questionMap = new Map();
         questions.forEach(row=>{
         if (!questionMap.has(row.question_id)) {
        questionMap.set(row.question_id, {
          question_id: row.question_id,
          question_text: row.question_text,
          difficulty: row.difficulty,
          marks: row.marks,
          order: row.question_order,
          options: []
        });
        examData.questions.push(questionMap.get(row.question_id));
      }
      questionMap.get(row.question_id).options.push({
        option_id: row.option_id,
        option_text: row.option_text
      });
   })
    return examData;
      }

      const formattedData=formatExamData(Allquestions)

      // set Redis  with ttl 
      const ttlseconds=Math.floor((endingTime-now)/1000);
    //    await redisClient.setEx(redisKey, ttlseconds, JSON.stringify(formattedData));

    return res.status(200).json({
      success: true,
      data: formattedData
    });


    } catch (error) {
        console.error("User Exam Fetch Error:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch exam questions for student"
        });
    }
}


// delete a question from an exam controller

const deleteQuestionFromExamController=async(req,res)=>{
    try {
        const {examId,questionId}=req.params;
        const adminId = req.user.userId;

        // Verify exam exists and belongs to admin
        const exam = await ExamModel.getExamByAdminAndExamID(examId,adminId);
        if(!exam) return res.status(404).json({ message: "Exam not found or unauthorized to delete question for this exam", success: false });
        // check question is exist or not
        const question= await QuestionModel.getQuestionById(questionId)
        if(!question) return res.status(404).json({message:"question is not found",success:false})
        // check the question belong to the exam or not

        const examQuestion=await ExamQuestionModel.getExamQuestionById(examId,questionId)

        if(!examQuestion) return res.status(404).json({message:"Question does not belong to this exam",success:false});

        // chect the exam status
        if(examQuestion.status === "completed" || examQuestion.status ==="ongoing"){
            return res.status(400).json({ success: false, message: "Cannot delete questions of a completed exam" });
        }

        // Delete the question from exam
        const deletedQuestion=await QuestionModel.deleteQuestionById(questionId)
        console.log(deletedQuestion)

        return res.status(200).json({message:"Question deleted from exam successfully",success:true});
    } catch (error) {
        console.error("Error deleting question from exam:", error);
        return res.status(500).json({ message: "Internal server error while deleting question from exam", success: false });
    }
}


// Update a question in an exam controller
const updateQuestionInExamController=async(req,res)=>{
    const {examId,questionId}=req.params;
    const adminId=req.user.userId;

    const {question_text,difficulty,marks,options}=req.body;

   try {
     // check the question is exist or not
    const question = await QuestionModel.getQuestionById(questionId);

    if(!question) return res.status(404).json({message:"Question not found",success:false});

    // check the exam is exist or not and ownership
    const exam= await ExamModel.getExamByAdminAndExamID(examId,adminId);

    if(!exam) return res.status(404).json({message:"Exam not found or unauthorized to update question for this exam",success:false});

    // check the question belong to the exam or not
    const examQuestion= await ExamQuestionModel.getExamQuestionById(examId,questionId);
    if(!examQuestion) return res.status(404).json({message:"Question does not belong to this exam",success:false});

    // chect the exam status
    if(examQuestion.status === "completed" || examQuestion.status ==="ongoing"){
        return res.status(400).json({ success: false, message: "Cannot update questions of a completed exam" });
    }
    // update question details

    const updatedQuestion= await QuestionModel.updateQuestionById(questionId,{question_text,marks,difficulty})

    // update options if provided
    if(options && Array.isArray(options)){
        const correctOptionCount=options.filter(otp=>otp.is_correct).length;

        if(correctOptionCount<1){
            return res.status(400).json({message:"At least one option must be correct",success:false});
        }
        // update each option by option id
        for(const opt of options){
            if(!opt.id){
                return res.status(400).json({message:"Option ID is required for updating option",success:false});
            }
             await OptionModel.updateOption(opt.id,{
                option_text:opt.option_text,
                is_correct:opt.is_correct
             })
        }

    }
    return res.status(200).json({message:"Question updated successfully",question:updatedQuestion,success:true});


   } catch (error) {
    return res.status(500).json({message:"Internal server error in update question in exam",success:false});
   }





}

// Controller to update the exam live (ongoing) by ID

const liveExamController=async(req,res)=>{
    try {
        const {examId}=req.params;
        const adminId=req.user.userId;
        // find the exam
        const exam= await ExamModel.getExamByAdminAndExamID(examId,adminId);
        if(!exam) return res.status(404).json({message:"Exam not found",success:false});
        // check the admin ownership
        if(exam.created_by !== adminId) return res.status(403).json({message:"You are not authorized to update this exam",success:false})
        // update exam status
        let newStatus;
        if(exam.status === "scheduled"){
            newStatus="ongoing";
        }else{
            return res.status(400).json({message:"Cannot update status of a completed exam",success:false})
        }
        const updatedExam=await ExamModel.updateExamStatusById(examId,adminId,newStatus);
        if(!updatedExam) return res.status(400).json({message:"Unable to update the exam status",success:false})
        return res.status(200).json({message:`Exam status updated to ${newStatus} successfully`,exam:updatedExam,success:true});
    } catch (error) {
        return res.status(500).json({message:"Internal server error in update exam status",success:false});
    }
}

// Controller to update the exam end(completed) by ID

const endExamController=async(req,res)=>{
    try {
        const {examId}=req.params;
        const adminId=req.user.userId;
        // find the exam
        const exam= await ExamModel.getExamByAdminAndExamID(examId,adminId);
        if(!exam) return res.status(404).json({message:"Exam not found",success:false});
        // check the admin ownership
        if(exam.created_by !== adminId) return res.status(403).json({message:"You are not authorized to update this exam",success:false})
        // update exam status
        let newStatus;
        if(exam.status === "ongoing"){
            newStatus="completed";
        }else{
            return res.status(400).json({message:"Cannot update status of a completed exam",success:false})
        }
        const updatedExam=await ExamModel.updateExamStatusById(examId,adminId,newStatus);
        if(!updatedExam) return res.status(400).json({message:"Unable to update the exam status",success:false})
        return res.status(200).json({message:`Exam status updated to ${newStatus} successfully`,exam:updatedExam,success:true});
    } catch (error) {
        return res.status(500).json({message:"Internal server error in update exam status",success:false});
    }
}


module.exports={createExamController,getexamByIdController,updateExamByIdController,deleteExamByIdController,getAllExamsByAdminController,addQuestionsToExamController,getAllQuestionsOfExamController,getAllQuestionsOfExamForStudentController,deleteQuestionFromExamController,updateQuestionInExamController,getAllExamsController,liveExamController,endExamController};