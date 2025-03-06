import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler( async(req,res)=>{
    //get user data from frontend
    //validaton checks
    //check if user already exists
    //check for image and avatar
    //upload image to cloudinary,avatar
    //create user object - create entry in db
    //remove password and refresh token field from res
    //return res
    const {fullname,email,username,password}=req.body
    console.log("email:",email);
})

export {registerUser}