const {v4 :uuidv4} =require("uuid")
const { pool } = require("../config/db")

class QuestionModel{
    // Initialize the questions table
    static async init(){
       const query = `
    CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY,
    question_text TEXT NOT NULL,
    difficulty VARCHAR(50) DEFAULT 'medium',
    marks INT NOT NULL,
    created_by UUID NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
`;
        try {
           await pool.query(query) 
            console.log("✅ Questions table initialized");
        } catch (error) {
            console.error("❌ Error creating questions table", error);
            throw error;
        }


    }


    static async insertQuestion(questions){
        
        const query=`
        INSERT INTO questions
        (id,question_text,difficulty,marks,created_by)
        VALUES($1,$2,$3,$4,$5)
        RETURNING *;
        `;
        const values=[questions.id,questions.question_text,questions.difficulty,questions.marks,questions.created_by];

        const result=await pool.query(query,values);
        return result.rows[0];
    }

    static async getQuestionById(questionId){
        const query=`
        SELECT *
        FROM questions
        WHERE id=$1
        `;
        const values=[questionId];
        const result=await pool.query(query,values)
        return result.rows[0];
    }


    static async deleteQuestionById(questionId){

        const query=`
        DELETE FROM questions
        WHERE id=$1
        `;
        const values=[questionId];
        const result=await pool.query(query,values)
        return result.rows[0];
    }
}

module.exports=QuestionModel;