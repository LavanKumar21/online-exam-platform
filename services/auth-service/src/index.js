require('dotenv').config();
const express=require('express');
const cors=require('cors');
const cookieParser=require('cookie-parser')
const {pool, connectDB} = require('./config/db');
const authrouter = require('./routes/authRoutes');
const UserModel = require('./models/userModel');


const app=express();
app.use(cors({
    origin: 'http://localhost:5173', // Replace with your frontend URL
}));
app.use(express.json());
app.use(cookieParser());

(async () => {
    try {
        // Connect to the database
        await connectDB();
        // Initialize the User table
        await UserModel.init();
        console.log("✅ User table ready");

       
    } catch (error) {
        console.error("❌ Failed to connect to the database or initialize User table", error);
        process.exit(1);
    }
})();

app.use("/auth", authrouter);


// Health check endpoint
app.get("/health",(req,res)=>{
    res.json({status:"Auth Service is running" });
})

const PORT=process.env.PORT || 4001




 // Start the server after initializing the database
    app.listen(PORT,()=>{
            console.log(`Auth Service is running on port ${PORT}`);
    })