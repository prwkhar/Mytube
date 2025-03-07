import { Router } from "express";
import { loginUser, logoutUser, registerUser,refreshToken,changepassword,updateprofile,updateavatar } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.midlewares.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    )

router.route("/login").post(loginUser)

//secured routes 
router.route("/logout").post(verifyJWT, logoutUser)

router.route("/refresh").post( refreshToken)

router.route("/changepassword").post(verifyJWT,changepassword)

router.route("/updateprofile").put(verifyJWT,updateprofile)

router.route("/updateavatar").put(
    verifyJWT,
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }
    ]),
    updateavatar
    )

export   default router