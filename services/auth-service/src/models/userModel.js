const { pool } = require("../config/db");

class UserModel{
    static async init(){
        const query=`
        CREATE TABLE IF NOT EXISTS users(
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        mobile_number VARCHAR(15),
        role VARCHAR(50) DEFAULT 'student',
        course VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
        )
        `;

        try {
            await pool.query(query);
            console.log("✅ User table initialized");
        } catch (err) {
            console.error('❌ Error creating users table', err);
            throw err;
        }
    }
    static async createUser({username,email,password,mobile_number,role,course}){
        const query=`
        INSERT INTO users (username,email,password,mobile_number,role,course)
        VALUES($1,$2,$3,$4,$5,$6)
        RETURNING id, username, email, mobile_number, role, course, created_at;
        `;
        const values=[username,email,password,mobile_number,role,course]
        const result= await pool.query(query,values)
        return result.rows[0];
    }
    // find user by email

    static async findByEmail(email){
        const query=`
            SELECT * FROM users WHERE email=$1
        `;
        const values=[email];
        const result=await pool.query(query,values)
        return result.rows[0];
    }


    static async getUserById(userId){
        const query=`
        SELECT id,username,email,mobile_number,role,course,created_at
        FROM users
        WHERE ID=$1
        `;

        const result= await pool.query(query,[userId])
        return result.rows[0]
    }

    static async updatePassword(userId,hashedNewPassword){

        const query=`UPDATE users SET password=$1 WHERE  id=$2`;
        const values=[hashedNewPassword,userId];
        const result=await pool.query(query,values);
        return result.rowCount>0;
    }

}

module.exports=UserModel;