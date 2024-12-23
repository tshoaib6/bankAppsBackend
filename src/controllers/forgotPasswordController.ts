import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { forgotPasswordService } from '../services/forgotPasswordService';
import User from '../models/user.model';  // Optional: We no longer need this for fetching the _id

// Generate JWT Token
const generateToken = (email: string, userId: string) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined.');
  }

  return jwt.sign({ email, userId }, process.env.JWT_SECRET as string, { expiresIn: '15m' });
};

// Request Password Reset - send OTP to email
export const requestPasswordReset = async (req: Request, res: Response): Promise<any> => {
  const email = req.body.email;  // Get email from request body

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    await forgotPasswordService.requestReset(email);
    return res.status(200).json({ message: 'OTP sent to email.' });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

// Verify OTP
// Verify OTP
export const verifyOTP = async (req: Request, res: Response): Promise<any> => {
    const { email, otp } = req.body;  // Only include email and otp in the request

    try {
        // Verify the OTP using the service function
        const isValid = await forgotPasswordService.verifyOTP(email, otp);

        if (isValid) {
            // Generate a new token using the email
            const newToken = generateToken(email, email);  // Use email as the userId

            // Send the new token to the user to proceed with password reset
            res.status(200).json({
                message: 'OTP verified successfully. You may proceed to reset your password.',
                token: newToken  // Return the generated token
            });
        } else {
            res.status(400).json({ message: 'Invalid or expired OTP.' });
        }
    } catch (error: any) {
        res.status(500).json({ message: 'Internal server error' });
    }
};



// Resend OTP
export const resendOTP = async (req: Request, res: Response): Promise<any> => {
  const email = req.body.email;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    await forgotPasswordService.resendOTP(email);
    res.status(200).json({ message: 'New OTP sent to your email.' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// Set New Password - after OTP verification

export const setNewPassword = async (req: Request, res: Response): Promise<any> => {
  const { newPassword, confirmPassword } = req.body;

  // Retrieve token from Authorization header
  const authorizationHeader = req.headers['authorization'];
  const token = authorizationHeader?.split(' ')[1]; // Extract Bearer token

  if (!token) {
    return res.status(401).json({ message: 'No token provided.' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match.' });
  }

  try {
    // Decode and verify the token
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

    // Extract email (or userId) from the token
    const userIdFromToken = decoded.email || decoded.userId;

    if (!userIdFromToken) {
      return res.status(400).json({ message: 'Invalid token or user mismatch.' });
    }

    // Proceed to update the password
    await forgotPasswordService.setNewPassword(userIdFromToken, newPassword);

    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }

    res.status(500).json({ message: 'Internal server error' });
  }
};

