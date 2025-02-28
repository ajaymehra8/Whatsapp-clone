import express,{Router} from 'express';
import { protectRoute } from '../utils/authUtils';
import { getUser, getUsers, updateProfile } from '../controller/userController';
import {uploadUserPhoto,uploadToCloudinary} from '../middlewares/fileUpload'
const router:Router=express.Router();

router.use(protectRoute);
router.get('/',getUsers);
router.get('/:userId',getUser);
router.patch('/update-profile',uploadUserPhoto,uploadToCloudinary, updateProfile);

export default router;