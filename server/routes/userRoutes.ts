import express,{Router} from 'express';
import { protectRoute } from '../utils/authUtils';
import { getUsers } from '../controller/userController';

const router:Router=express();



router.use(protectRoute);
router.get('/',getUsers);
export default router;