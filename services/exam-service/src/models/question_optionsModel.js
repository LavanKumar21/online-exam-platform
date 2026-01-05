const {v4 :uuidv4} =require("uuid")
const { pool } = require("../config/db")

class OptionModel{
    // Initialize the question_options table

    static async init(){
        const query = `
    CREATE TABLE IF NOT EXISTS questionoptions (
    id UUID PRIMARY KEY,
    question_id UUID NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    CONSTRAINT fk_question_options_question
        FOREIGN KEY (question_id)
        REFERENCES questions(id)
        ON DELETE CASCADE
);
`;
        try {
            await pool.query(query)
            console.log("✅ Question Options table initialized");
        } catch (error) {
            console.error("❌ Error creating question options table", error);
            throw error;
        }
    }


static async insertOption(option){
    const optionID=uuidv4();
    const query=`
    INSERT INTO questionoptions (
        id,
        question_id,
        option_text,
        is_correct
      )
      VALUES ($1, $2, $3, $4)
    `;
    const values=[
        optionID,
        option.question_id,
        option.option_text,
        option.is_correct || false
    ];

    const result=await pool.query(query,values);
    return result.rows[0];
}
    
}
module.exports=OptionModel;