const authorization=(...roles)=>{
    return (req,res,next)=>{
        try {
            const user=req.user;
            if(!user.role) return res.status(401).json({message:"Unauthorized: User not authenticated for this action",sucess:false});

            if(!roles.includes(user.role)) return res.status(403).json({message:"Forbidden: You don't have permission to access this resource",sucess:false});
            next();
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Internal server error in role middleware",
            });
        }
    }
}

module.exports={authorization}