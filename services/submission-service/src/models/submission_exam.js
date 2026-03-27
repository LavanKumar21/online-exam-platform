const { pool } = require("../config/db");
const {v4 :uuidv4} =require("uuid")
class ExamSubmission {

    static async init() {
    const query = `
    CREATE TABLE IF NOT EXISTS exam_submissions (
        id UUID PRIMARY KEY,

        exam_id UUID NOT NULL,
        student_id UUID NOT NULL,
        question_id UUID NOT NULL,
        selected_option_id UUID NOT NULL,

        submitted_at TIMESTAMPTZ DEFAULT NOW(),

        CONSTRAINT fk_exam
            FOREIGN KEY (exam_id)
            REFERENCES exams(id)
            ON DELETE RESTRICT,

        CONSTRAINT fk_student
            FOREIGN KEY (student_id)
            REFERENCES users(id)
            ON DELETE RESTRICT,

        CONSTRAINT fk_question
            FOREIGN KEY (question_id)
            REFERENCES questions(id)
            ON DELETE RESTRICT,

        CONSTRAINT unique_exam_student_question
            UNIQUE (exam_id, student_id, question_id)
    );

    CREATE INDEX IF NOT EXISTS idx_submission_exam_student
        ON exam_submissions (exam_id, student_id);

    CREATE INDEX IF NOT EXISTS idx_submission_exam
        ON exam_submissions (exam_id);
    `;

    try {
        await pool.query(query);
        console.log("✅ Exam submissions table initialized");
    } catch (err) {
        console.error("❌ Error creating exam_submissions table", err);
        throw err;
    }
}

static async submitExam(examId, studentId, answers) {
    const values = [];
    const placeholders = [];
    answers.forEach((ans, index) => {
        const submissionId = uuidv4();
        const baseIndex= index *5

        placeholders.push(`($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5})`);

        values.push(
            submissionId,
            examId,
            studentId,
            ans.questionId,
            ans.selectedOptionId
        )
    })

    const query=`
    INSERT INTO exam_submissions(id, exam_id, student_id, question_id, selected_option_id)
    VALUES ${placeholders.join(", ")}
    ON CONFLICT (exam_id, student_id, question_id)
    DO NOTHING;
    `;
    const result =await pool.query(query,values)
    return result.rows[0];
}




}

module.exports=ExamSubmission