import express, { Router } from "express";
import {deleteMessageForEveryone, deleteMessageForMe, doMessage, getAllMessage} from "../controller/messageController";
import { protectRoute } from "../utils/authUtils";

const router: Router = express.Router();

router.use(protectRoute);
router.route("/").post(doMessage).get(getAllMessage);
router.post("/delete-for-me",deleteMessageForMe);
router.post("/delete-for-everyone",deleteMessageForEveryone);

export default router;
