import express from "express";
import{ registerUser,
        loginUser, 
        logOutUser , 
        refreshAccessToken, 
        changePassword, 
        getCurrentUser, 
        updateAccountDetails, 
        updateAvatar, 
        updateUserCoverImage, 
        getUserChannelProfile, 
        getWatchHistory
      } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js"; // ✅ adjust path as needed

const router = express.Router();

// Apply multer middleware here
router.post(
  "/register",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 }
  ]),
  registerUser
);

router.post("/login", loginUser);
router.post("/logout", verifyJWT, logOutUser);
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT , changePassword)
router.route("/current-use").post(verifyJWT , getCurrentUser)
router.route("/update-account").patch(verifyJWT , updateAccountDetails)
router.route("/avatar").patch(verifyJWT , upload.single("avatar") , updateAvatar)
router.route("/coverImage").patch(verifyJWT , upload.single("converImage") , updateUserCoverImage)
router.route("/c/:username").get(verifyJWT , getUserChannelProfile)
router.route("/watch-history").get(verifyJWT , getWatchHistory)


export default router;
