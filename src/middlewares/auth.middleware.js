import { apiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken"
import { User } from "../models/user.models";

//verify user is or not
export const verifyJWT = asyncHandler(async(req,res,next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        if(!token)
        {
            throw new apiError(401,"unauthorized request/access")
        }
    
        const decoded_token = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decoded_token?._id).select("-password -refreshToken")
    
        if(!user){
             throw new apiError(401,"Invalid Access Token")
        }
        req.user=user;
        next();
    } catch (error) {
        throw new apiError(401,error?.message||"Invalid access token")
    }
})