import { Router } from 'express';
import { register, login, verify, resendOtp, getMe, updateProfile } from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify', verify);
router.post('/resend', resendOtp);

// Profile routes
router.get('/me', authenticate, getMe);
router.patch('/profile', authenticate, updateProfile);

export default router;
