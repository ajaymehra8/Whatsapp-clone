import express, { Router } from "express";
import { protectRoute } from "../utils/authUtils";
import {
  getAllChats,
  createChat,
  getChat,
  notifyUser,
  deleteChat,
  pinChat,
  unpinChat,
  createGroup,
  getGroupMembers,
  leaveGroup,
  removeGroupMembers,
  addGroupMembers,
  updateGroup,
} from "../controller/chatController";
import {
  uploadGroupImageToCloudinary,
  uploadGroupPhoto,
} from "../middlewares/fileUpload";
const router: Router = express.Router();

router.use(protectRoute);

router.route("/").post(createChat).get(getAllChats);
router.post("/push-notification", notifyUser);
router.post("/delete-chat", deleteChat);
router.route("/:selectedUserId").get(getChat);
router.post("/pin-chat", pinChat);
router.post("/unpin-chat", unpinChat);
router.post(
  "/create-group",
  uploadGroupPhoto,
  uploadGroupImageToCloudinary,
  createGroup
);
router.post("/group/leave-group", leaveGroup);
router.post("/group/remove-member", removeGroupMembers);
router.post("/group/addMembers", addGroupMembers);
router.patch(
  "/group/updateGroup",
  uploadGroupPhoto,
  uploadGroupImageToCloudinary,
  updateGroup
);

router.post("/group/:groupId", getGroupMembers);

export default router;
