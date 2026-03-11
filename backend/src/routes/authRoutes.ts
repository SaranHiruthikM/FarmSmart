import { Router } from 'express';
import { register, login, getMe, updateProfile, uploadKYC } from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';
import { upload } from "../middleware/uploadMiddleware";

const router = Router();

router.post('/register', register);
router.post('/login', login);

// Profile routes
router.get('/me', authenticate, getMe);
router.patch('/profile', authenticate, updateProfile);
router.post('/kyc', authenticate, upload.single('document'), uploadKYC);

export default router;
