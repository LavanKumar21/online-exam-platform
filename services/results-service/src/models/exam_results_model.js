const { pool } = require("../config/db");
const {v4 :uuidv4} =require("uuid")

class ExamResultsModel{

    // Initialize the exam_results table
static async init() {
    const query = `
    CREATE TABLE IF NOT EXISTS exam_results (
    id UUID PRIMARY KEY,

    exam_id UUID NOT NULL,
    student_id UUID NOT NULL,

    total_questions INT NOT NULL,
    attempted_questions INT NOT NULL,
    correct_answers INT NOT NULL,
    wrong_answers INT NOT NULL,

    score INT NOT NULL,
    percentage DECIMAL(5,2),

    status VARCHAR(50) DEFAULT 'pending',

    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ,

    email_status VARCHAR(50) DEFAULT 'pending', 
    email_sent_at TIMESTAMPTZ,

    calculated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ,

    CONSTRAINT unique_exam_student UNIQUE (exam_id, student_id)
);
    `;

    // email_status can be 'pending', 'sent', 'failed'
    // status can be 'pending', 'passed', 'failed'
    // percentage is calculated as (score / total_questions) * 100
    

    try {
        await pool.query(query);
        console.log("✅ Exam results table initialized");
    } catch (err) {
        console.error("❌ Error creating exam_results table", err);
        throw err;
    }
}


static async getExamResultsByExamId(examId){
    const query=`
     SELECT
        id,
        student_id,
        total_questions,
        correct_answers,
        wrong_answers,
        score,
        status,
        calculated_at
      FROM exam_results
      WHERE exam_id = $1
      ORDER BY score DESC;
    `;
    const values=[examId];
    const result=await pool.query(query,values)
    return result.rows;
}

static async calculateExamResultsByExamId(examId){
    const query=`
            SELECT 
                es.student_id,

                COUNT(q.id) AS total_questions,
                COUNT(es.question_id) AS attempted_questions,

                SUM(CASE 
                    WHEN qo.is_correct = TRUE THEN 1 
                    ELSE 0 
                END) AS correct_answers,

                SUM(CASE 
                    WHEN qo.is_correct = FALSE THEN 1 
                    ELSE 0 
                END) AS wrong_answers,

                SUM(CASE 
                    WHEN qo.is_correct = TRUE THEN q.marks 
                    ELSE 0 
                END) AS score

            FROM exam_submissions es
            JOIN questions q ON es.question_id = q.id
            JOIN questionoptions qo ON es.selected_option_id = qo.id

            WHERE es.exam_id = $1
            GROUP BY es.student_id
        `;
        const values=[examId]
        const results=await pool.query(query,values)
        return results.rows;
}

static async insertExamResults(examId,results){
    if(results.length===0) return;
    const values=[];
    const placeholders=[];
    results.forEach((row, index) => {
            const id = uuidv4();

            const totalQuestions = Number(row.total_questions);
            const score = Number(row.score);

            const percentage = totalQuestions > 0
                ? (score / (totalQuestions * 1)) * 100
                : 0;

            const baseIndex = index * 10;

            placeholders.push(`
                ($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3},
                 $${baseIndex + 4}, $${baseIndex + 5}, $${baseIndex + 6},
                 $${baseIndex + 7}, $${baseIndex + 8}, $${baseIndex + 9},
                 NOW())
            `);

            values.push(
                id,
                examId,
                row.student_id,
                totalQuestions,
                Number(row.attempted_questions),
                Number(row.correct_answers),
                Number(row.wrong_answers),
                score,
                percentage
            );
        });

      const query = `
            INSERT INTO exam_results (
                id,
                exam_id,
                student_id,
                total_questions,
                attempted_questions,
                correct_answers,
                wrong_answers,
                score,
                percentage,
                calculated_at
            )
            VALUES ${placeholders.join(",")}
            ON CONFLICT (exam_id, student_id)
            DO UPDATE SET
                total_questions = EXCLUDED.total_questions,
                attempted_questions = EXCLUDED.attempted_questions,
                correct_answers = EXCLUDED.correct_answers,
                wrong_answers = EXCLUDED.wrong_answers,
                score = EXCLUDED.score,
                percentage = EXCLUDED.percentage,
                updated_at = NOW()
        `;
        const result = await pool.query(query, values);
        return result.rowCount;
}

static async getStudentExamResults(examId,studentId){
    const query=`
    SELECT
        id,
        exam_id,
        student_id,
        total_questions,
        attempted_questions,
        correct_answers,
        wrong_answers,
        score,
        percentage,
        calculated_at
    FROM exam_results
    WHERE exam_id = $1 AND student_id = $2
    `;
    const values=[examId,studentId];
    const result=await pool.query(query,values)
    return result.rows[0];
}

}

module.exports=ExamResultsModel
