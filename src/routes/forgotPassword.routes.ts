import { Router } from 'express';
import { requestPasswordReset, verifyOTP, resendOTP, setNewPassword } from '../controllers/forgotPasswordController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Request password reset (send OTP)
router.post('/forgot-password', requestPasswordReset);

// Verify OTP for password reset
router.post('/verify-otp', verifyOTP);

// Resend OTP for password reset
router.post('/resend-otp', resendOTP);

// Set new password after OTP verification
router.post('/set-new-password', setNewPassword);  // Apply authMiddleware here

export default router;
