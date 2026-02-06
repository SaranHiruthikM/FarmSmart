import { Router } from 'express';
import { register, login, verify, resendOtp } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify', verify);
router.post('/resend', resendOtp);

export default router;
