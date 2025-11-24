const express=require('express');
const cors=require('cors');
require('dotenv').config();

const app=express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health",(req,res)=>{
    res.json({status:"Auth Service is running" });
})

const PORT=process.env.PORT || 4001

app.listen(PORT,()=>{
    console.log(`Auth Service is running on port ${PORT}`);
})