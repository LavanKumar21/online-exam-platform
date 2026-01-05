const {v4 :uuidv4} =require("uuid")
const { pool } = require("../config/db")

class ExamModel{
    // Initialize the exams table
    static async init(){
        const query=`
        CREATE TABLE IF NOT EXISTS exams(
        id UUID PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        duration INT NOT NULL,
        total_marks INT NOT NULL,
        passing_marks INT NOT NULL,
        total_questions INT NOT NULL,
        created_by UUID NOT NULL,
        scheduled_datetime TIMESTAMP,
        status VARCHAR(50) DEFAULT 'scheduled',
        created_at TIMESTAMP DEFAULT NOW(),
        is_deleted BOOLEAN DEFAULT FALSE,
        deleted_at TIMESTAMPTZ,
        updated_at TIMESTAMPTZ
        );
        `;
         try {
            await pool.query(query);
            console.log("✅ Exam table initialized");
        } catch (err) {
            console.error('❌ Error creating exam table', err);
            throw err;
        }
    }

    // Create a new exam
    static async createExam(data){
        const examId=uuidv4();
        
        const query=`
            INSERT INTO exams(
            id,title,description,category,duration,total_marks,passing_marks,total_questions,created_by,scheduled_datetime,status)
            VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
            RETURNING *;
        `;

        const values=[
            examId,
            data.title,
            data.description,
            data.category,
            data.duration,
            data.total_marks,
            data.passing_marks,
            data.total_questions,
            data.created_by,
            data.scheduled_datetime,
            data.status || 'scheduled'                  
        ]

        console.log(values)
        const result=await pool.query(query,values)
        
        return result.rows[0];

    }
    // Fetch exam by ID
    static async getExamById(examId){
        const query=`
        SELECT * FROM exams WHERE id=$1;`;
        const values=[examId];
        const result=await pool.query(query,values)
        return result.rows[0];
    }

    static async getExamByAdminAndExamID(examId,adminId){
        const query=`
        SELECT * FROM exams WHERE id=$1 AND created_by=$2 AND is_deleted=FALSE;`;
        const values=[examId,adminId];
        const result=await pool.query(query,values);
        return result.rows[0];
    }

    // Update exam by ID
    static async updateExamById(examId,adminId,updateData){

        const fields=[];
        const values=[];
        let index=1;

        for(const key in updateData){
            fields.push(`${key}=$${index} `)
            values.push(updateData[key]);
            index++;
        }
        // Add updated_at
        fields.push(`updated_at = NOW()`);
        // update the adminId and examId
        values.push(examId);
        values.push(adminId);

        const query=`
        UPDATE exams 
        SET ${fields.join(", ")}
        WHERE id=$${index} AND created_by=$${index+1}
        RETURNING *;
        `;
        const result= await pool.query(query,values);
        return result.rows[0];
    }


   // Soft delete exam by ID
    static async deleteExamById(examId, adminId) {
    const query = `
        UPDATE exams
        SET 
            is_deleted = TRUE,
            deleted_at = NOW()
        WHERE 
            id = $1 
            AND created_by = $2
            AND is_deleted = FALSE
        RETURNING *;
    `;

    const values = [examId, adminId];
    const result = await pool.query(query, values);
    return result.rows[0];
    }


    // Get all exams by specific admin
    static async getAllExamsByAdmin(adminId){
        const query=`
        SELECT * FROM exams WHERE created_by = $1 AND is_deleted=FALSE;
        `;

        const values=[adminId];
        const result=await pool.query(query,values);
        return result.rows;
    }

    // get status of exam by ID 
    static async getExamStatusById(examId){
        const query=`
        SELECT status FROM exams
        WHERE id=$1;
        `;
        const values=[examId];
        const result=await pool.query(query,values);
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