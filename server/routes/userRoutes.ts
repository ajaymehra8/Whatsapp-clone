import express, { Router } from "express";
import { protectRoute } from "../utils/authUtils";
import {
  changePrivacy,
  getUser,
  getUsers,
  updateProfile,
} from "../controller/userController";
import {
  uploadUserPhoto,
  uploadUserImageToCloudinary,
} from "../middlewares/fileUpload";
const router: Router = express.Router();

router.use(protectRoute);
router.get("/", getUsers);
router.patch("/change-privacy", changePrivacy);

router.get("/:userId", getUser);
router.patch(
  "/update-profile",
  uploadUserPhoto,
  uploadUserImageToCloudinary,
  updateProfile
);
export default router;
