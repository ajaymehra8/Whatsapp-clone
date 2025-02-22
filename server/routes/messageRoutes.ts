import express, { Router } from "express";
import {doMessage, getAllMessage} from "../controller/messageController";
import { protectRoute } from "../utils/authUtils";

const router: Router = express.Router();

router.use(protectRoute);
router.route("/").post(doMessage).get(getAllMessage);

export default router;
