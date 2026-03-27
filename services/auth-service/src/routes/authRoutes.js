const express=require('express');
const { register, login, viewProfile, resetPassword, deleteUser, logout } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authmiddleware');
const authrouter=express.Router()


authrouter.post("/register",register)
authrouter.post("/login",login)
authrouter.get("/profile",authMiddleware,viewProfile)
authrouter.post("/reset-password",authMiddleware,resetPassword)
authrouter.delete("/delete/user",authMiddleware,deleteUser)
authrouter.post("/logout",authMiddleware,logout)
module.exports=authrouter