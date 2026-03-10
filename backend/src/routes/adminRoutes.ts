import express from 'express';
import { adminLogin, getPendingVerifications, verifyUserKYC, getDashboardStats } from '../controllers/adminController';
import { authenticate, adminOnly } from '../middleware/authMiddleware';

const router = express.Router();

// Public Admin Route (Bypass login)
router.post('/login', adminLogin);

// Protected Admin Routes
router.use(authenticate, adminOnly);

// Dashboard
router.get('/dashboard', getDashboardStats);

// KYC Endpoints
router.get('/kyc/pending', getPendingVerifications);
router.put('/kyc/:userId', verifyUserKYC);

export default router;
