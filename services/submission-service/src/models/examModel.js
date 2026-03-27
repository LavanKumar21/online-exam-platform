const { pool } = require("../config/db");

class ExamModel{

        // Fetch exam by ID
    static async getExamById(examId){
        const query=`
        SELECT * FROM exams WHERE id=$1;`;
        const values=[examId];
        const result=await pool.query(query,values)
        return result.rows[0];
    }

}

module.exports=ExamModel;