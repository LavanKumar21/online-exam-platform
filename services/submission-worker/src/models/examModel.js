const { pool } = require("../config/db");

class ExamModel{

       static async getExamById(examId){
        const query=`
        SELECT * FROM exams WHERE id=$1;`;
        const values=[examId];
        const result=await pool.query(query,values)
        return result.rows[0];
    }

    // update exam status by ID
    static async updateExamStatusById(examId,status){
        const query=`
        UPDATE exams
        SET status=$1, updated_at=NOW()
        WHERE id=$2
        RETURNING *;
        `;
        const values=[status,examId];

        const result=await pool.query(query,values);
        return result.rows[0];
    }

}
module.exports=ExamModel;