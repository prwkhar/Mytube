import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { cloudinary_uploader } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import { upload } from "../middlewares/multer.midlewares.js";
import jwt from "jsonwebtoken";

const generateAccessandRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new apiError(500, "something went wrong while generating tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //get user data from frontend ✔️
  //validaton checks ✔️
  //check if user already exists ✔️
  //check for image and avatar ✔️
  //upload image to cloudinary,avatar✔️
  //create user object - create entry in db✔️
  //remove password and refresh token field from res ✔️
  //return res ✔️
  const { fullName, email, username, password } = req.body;
  console.log(req.body);

  //validation check
  if (fullName == "") throw new apiError(400, "full name required");
  //add more validation check later

  //check if user already exist
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new apiError(409, "user with email or username already exist");
  }

  //access of files given by multer
  const avatarlocalpath = req.files?.avatar[0]?.path;
  console.log(req.files);
  const coverimagelocalpath = req.files?.coverImage[0]?.path;

  if (!avatarlocalpath) {
    throw new apiError(400, "Avatar is required");
  }

  //upload them to cloudinary
  const avatar = await cloudinary_uploader(avatarlocalpath);
  const coverimage = await cloudinary_uploader(coverimagelocalpath);

  if (!avatar) throw new apiError(400, "Avatar is required");

  const userref = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverimage?.url || "",
    email,
    password,
    username: username,
  });

  const createduser = await User.findById(userref._id).select(
    "-password -refreshToken"
  );

  if (!createduser) {
    throw new apiError(500, "something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new apiResponse(200, createduser, "user registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  //get the username and password from the user
  //check if user is present in out database
  //password check
  //generate the tokens for the user
  //send cookie
  console.log(req.body);

  const { email, username, password } = req.body;

  if (!username && !email) {
    throw new apiError(400, "Username or email is required");
}


  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new apiError(400, "user not exist");
  }

  const ispassvalid = await user.isPasswordCorrect(password)

  if (!ispassvalid) {
    throw new apiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessandRefreshTokens(
    user._id
  );

  //sending to cookies
  const loggedinuser = await User.findById(User._id).select(
    "-password -refreshToken"
  );

  //because of this its can only be modified from server
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponse(
        200,
        {
          user: loggedinuser,
          accessToken,
          refreshToken,
        },
        "user logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options={
    httpOnly: true,
    secure: true,
  }

  return res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(new apiResponse(200,{},"User logged out successfully"))
});

const refreshToken = asyncHandler(async (req, res) => {
  const incomingrefreshtoken = req.cookies.refreshToken||req.body.refreshToken;
  if(!incomingrefreshtoken){
    throw new apiError(401,"refresh token is required")
    }
  try {
    const decodedtoken = jwt.verify(incomingrefreshtoken,process.env.REFRESH_TOKEN_SECRET)
    const user = await User.findById(decodedtoken?._id)
    if(!user){
      throw new apiError(401,"invalid refresh token")
    }
    if(incomingrefreshtoken!==user?.refreshToken){
      throw new apiError(401,"refresh token is expired or used")
    }
    const options={
      httpOnly: true,
      secure: true,
    }
    const {accessToken,newrefreshToken} = await generateAccessandRefreshTokens(user._id)
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newrefreshToken,options)
    .json(new apiResponse(200,accessToken,newrefreshToken,"Token refreshed successfully"))
  } catch (error) {
    throw new apiError(401,error?.message||"invalid refresh token")
  }
});

const changepassword = asyncHandler(async (req, res) => {
  //get the user from the request
  //get the old password and new password from the request
  //check if the old password is correct
  //change the password
  //save the user
  //return the response
  console.log(req.body);
  const { oldpassword, newpassword } = req.body;
  console.log(req.user);
  const user = req.user;
  const userref = await User.findById(user._id);
  if (!oldpassword || !newpassword) {
    throw new apiError(400, "old password and new password is required");
  }
  console.log(oldpassword, newpassword);
  const ispassvalid = await userref.isPasswordCorrect(oldpassword);

  if (!ispassvalid) {
    throw new apiError(401, "Invalid user credentials");
  }

  user.password = newpassword;
  await user.save();

  return res.status(200).json(new apiResponse(200, {}, "password changed"));
});

const updateprofile = asyncHandler(async (req, res) => {
  //get the user from the request
  //get the data from the request
  //update the user
  //save the user
  //return the response
  const user = req.user;
  const { fullName, email, username } = req.body;

  if(!fullName&&!email&&!username){
    throw new apiError(400,"atleast one field is required")
  }
  if(fullName){
    user.fullName = fullName
  }
  if(email){
    user.email = email
  }
  if(username){
    user.username = username
  }
  await user.save()
  return res.status(200).json(new apiResponse(200,user,"profile updated successfully"))
});

const updateavatar = asyncHandler(async (req, res) => {
  //get the user from the request
  //get the avatar from the request
  //upload the avatar to cloudinary
  //update the user
  //save the user
  //return the response
  const user = req.user;
  const avatarlocalpath = req.files?.avatar[0]?.path;
  if (!avatarlocalpath) {
    throw new apiError(400, "Avatar is required");
  }
  if(user.avatar){
    const public_id = user.avatar.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(public_id);
  }
  const avatar = await cloudinary_uploader(avatarlocalpath);
  user.avatar = avatar.url;
  await user.save();
  return res.status(200).json(new apiResponse(200,user,"avatar updated successfully"))
});
export { registerUser, loginUser, logoutUser,refreshToken,changepassword , updateprofile,updateavatar};
