const { pool } = require("../config/db");
const {v4 :uuidv4} =require("uuid")
class ExamSubmissionModel{

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

module.exports=ExamSubmissionModel;
