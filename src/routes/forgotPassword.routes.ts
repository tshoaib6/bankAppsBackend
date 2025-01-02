import { Router } from 'express';
import { requestPasswordReset, verifyOTP, resendOTP, setNewPassword } from '../controllers/forgotPasswordController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/forgot-password', requestPasswordReset);

router.post('/verify-otp', verifyOTP);

router.post('/resend-otp', resendOTP);

router.post('/set-new-password', setNewPassword);  // Apply authMiddleware here

export default router;
