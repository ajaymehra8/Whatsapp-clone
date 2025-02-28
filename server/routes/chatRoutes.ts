import express, { Router } from "express";
import { protectRoute } from "../utils/authUtils";
import {getAllChats,createChat, getChat, notifyUser, deleteChat, pinChat, unpinChat} from "../controller/chatController";
const router: Router = express.Router();

router.use(protectRoute);
router.route("/").post(createChat).get(getAllChats);
router.post("/push-notification",notifyUser);
router.post("/delete-chat",deleteChat);
router.route("/:selectedUserId").get(getChat);
router.post("/pin-chat",pinChat);
router.post("/unpin-chat",unpinChat);

export default router;
