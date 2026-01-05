const jwt=require("jsonwebtoken")

const authMiddleware=(req,res,next)=>{
    try {
        const token= req.cookies.token
        if(!token) return res.status(401).json({message:"No token, authorization denied",sucess:false});

        jwt.verify(token,process.env.JWT_SECRET,(err,decoded)=>{
            if(err) return res.status(401).json({message:"Token is not valid",sucess:false});

            req.user=decoded;
            next();
        })

    } catch (error) {
        return res.status(500).json({message:"Internal server error in authentication",sucess:false})
    }
}

module.exports={authMiddleware};