const {v4 :uuidv4} =require("uuid")
const { pool } = require("../config/db")


class ExamQuestionModel{

    // Initialize the exam_questions table
     static async init() {
    const query = `
      CREATE TABLE IF NOT EXISTS exam_questions (
        id UUID PRIMARY KEY,
        exam_id UUID NOT NULL,
        question_id UUID NOT NULL,
        question_order INT,
        created_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT fk_exam_questions_exam
          FOREIGN KEY (exam_id)
          REFERENCES exams(id)
          ON DELETE CASCADE,
        CONSTRAINT fk_exam_questions_question
          FOREIGN KEY (question_id)
          REFERENCES questions(id)
          ON DELETE CASCADE,
        CONSTRAINT unique_exam_question
          UNIQUE (exam_id, question_id)
      );
    `;
    try {
           await pool.query(query) 
            console.log("✅ Exam questions table initialized");
        } catch (error) {
            console.error("❌ Error creating questions table", error);
            throw error;
        }
  }


 static async insertExamQuestion(data) {
    const id=uuidv4();
     const query = `INSERT INTO exam_questions 
     (id, exam_id, question_id, question_order) 
     VALUES ($1, $2, $3, $4)
     RETURNING *;
     `;
     const values = [ id, data.exam_id, data.question_id, data.question_order ]; 
     const result=await pool.query(query,values)
     return result.rows[0];
    }


    static async countByExamId(examId){
        const query=`
        SELECT COUNT(*)::int AS count
        FROM exam_questions
        WHERE exam_id=$1;
        `;
        const values=[examId];

        const result=await pool.query(query,values);
        return result.rows[0];
    }

    static async getQusetionsByExamId(examId){
       const query = `
    SELECT
      e.id AS exam_id,
      e.title,
      e.duration,
      e.total_questions,
      q.id AS question_id,
      q.question_text,
      q.difficulty,
      q.marks,
      eq.question_order,
      qo.id AS option_id,
      qo.option_text
    FROM exams e
    JOIN exam_questions eq ON eq.exam_id = e.id
    JOIN questions q ON q.id = eq.question_id
    JOIN questionoptions qo ON qo.question_id = q.id
    WHERE e.id = $1
      AND e.is_deleted = false
      AND q.is_deleted = false
      AND qo.is_deleted = false
    ORDER BY eq.question_order, qo.created_at;
  `;
      const result= await pool.query(query, [examId]);
      return result.rows;
    }

}

module.exports=ExamQuestionModel;