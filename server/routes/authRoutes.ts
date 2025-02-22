import { login, signup } from '../controller/authContoller';
import express,{Router} from 'express';

const router:Router=express();

router.post('/signup',signup);
router.post('/login',login);
export default router;