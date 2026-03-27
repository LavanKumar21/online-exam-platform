const UserModel = require("../models/userModel")
const bcrypt=require("bcryptjs")
const jwt=require("jsonwebtoken")
const sendEmail = require("../config/email")
const emailTemplate = require("../utils/emailtemplate")

// register controller
const register=async(req,res)=>{
    const {username,email,password,mobile_number,role,course}=req.body 
    try {
        
        // check user already exists
        const existinguser= await UserModel.findByEmail(email);
        if(existinguser){
            return res.status(400).json({message:"User already exists with this email"})
        }

        // hash password
        const salt= await bcrypt.genSalt(10);
        const hashedpassword= await bcrypt.hash(password,salt)

        // create user
         const newUser= await UserModel.createUser({
            username,
            email,
            password:hashedpassword,
            mobile_number,
            role:role || 'student',
            course
         })
         sendEmail(email,"Welcome to EduPlatform", emailTemplate(username,role,course))
            res.status(201).json({user:newUser});

    } catch (error) {
        console.error(error);
        res.status(500).json({message:"Server Error",error:error.message});
    }
}

// login controller
const login=async(req,res)=>{
    const {email,password}=req.body;
    try {
        //find user by email
        const user= await UserModel.findByEmail(email);

        if(!user) return res.status(400).json({message:"Mail ID is not registered"})

        // compare password
        const isMatch=await bcrypt.compare(password,user.password)
        if(!isMatch) return res.status(400).json({message:"Invalid Password"});

        // generate token
        const token =  jwt.sign({userId:user.id,role:user.role},process.env.JWT_SECRET,{expiresIn:'1h'})

        // send token via cookies
        res.cookie('token',token,{
            httpOnly:true,
            secure:process.env.NODE_ENV==='production',
            sameSite:'strict',
            maxAge:60*60*1000  // 1hr
        })

        res.status(200).json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                mobile_number: user.mobile_number,
                role: user.role,
                course: user.course
            },
            message: "Login Successful"
        });
    } catch (error) {
        res.status(500).json({message:"Server Error"})
    }
}

// forgot password controller
    const forgotPassword=async(req,res)=>{
    // Implementation for forgot password
    }
// reset password controller
const resetPassword=async(req,res)=>{
    const {userId}=req.user
    const {newPassword,oldPassword}=req.body

    try {
        const user= await UserModel.findById(userId)
        console.log(user)
        if(!user) return res.status(404).json({message:"user not found",sucess:false});

        // compare old password
        const isMatch=await bcrypt.compare(oldPassword,user.password)

        if(!isMatch) return res.status(400).json({message:"Invalid Old Password",sucess:false});

        // hash new password
        const salt=await bcrypt.genSalt(10);
        const hashedNewPassword= await bcrypt.hash(newPassword,salt);
        // update password
        const result=await UserModel.updatePassword(userId,hashedNewPassword)
        if(!result) return res.status(500).json({message:"Failed to update password",sucess:false});

        res.status(200).json({message:"Password updated successfully",sucess:true});
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"Internal server error in reset password",sucess:false});
    }
}
// view profile controller
    const viewProfile=async(req,res)=>{
        try {
            const userId=req.user.userId
            const user= await UserModel.getUserById(userId)
            if(!user) return res.status(404).json({message:"user not found",sucess:false});
            res.status(200).json({user,sucess:true})
        } catch (error) {
            return res.status(500).json({message:"Internal server error in view profile",sucess:false})
        }
    }

// logout controller

const logout =async(req,res)=>{
    try {
        res.clearCookie('token',{
            httpOnly:true,
            secure:process.env.NODE_ENV==='production',
            sameSite:'strict'
        })
        res.status(200).json({message:"Logout successful"})
    } catch (error) {
        return res.status(500).json({message:"Internal server error in logout",sucess:false})
    }
}


// verify email controller

const verifyEmail=async(req,res)=>{
    // Implementation for email verification

}

const deleteUser=async(req,res)=>{
    const {userId}=req.params
    try {
        const result= await UserModel.deleteUser(userId)
        if(!result) return res.status(404).json({message:"User not found or already deleted",sucess:false})
        res.status(200).json({message:"User deleted successfully",sucess:true})                     
    } catch (error) {
        return res.status(500).json({message:"Internal server error in delete user",sucess:false})
    }
}


module.exports={register,login,viewProfile,logout,resetPassword,deleteUser}