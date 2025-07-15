import express from "express";
import { registerUser, loginUser, logOutUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js"; // ✅ adjust path as needed

const router = express.Router();

// ✅ Apply multer middleware here
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

export default router;
