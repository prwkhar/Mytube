import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { cloudinary_uploader } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import { upload } from "../middlewares/multer.midlewares.js";

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

export { registerUser };
