// controllers/qrCodeController.ts

import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { handleQRCodeScan } from '../services/qrCodeScanService';

export const scanQRCode = async (req: Request, res: Response): Promise<any> => {
  try {
    // Extract user ID from the token
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Authorization token required' });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.userId;

    // Get scanned QR code data from the request body
    const { scannedCode } = req.body;
    if (!scannedCode) {
      return res.status(400).json({ message: 'Scanned code is required' });
    }

    // Call service function to handle the scanning logic
    const result = await handleQRCodeScan(userId, scannedCode);

    // Extract updated user data and user history
    const updatedUser = result.updatedUser;  // Contains updated user data (points, etc.)
    const userHistory = result.userHistory;  // Contains the new user history entry

    // Return success response with updated user data, user history, and points
    return res.status(200).json({
      message: 'QR Code scanned successfully. Points added to your account.',
      userId: updatedUser._id,  // userId of the scanned user
      userPoints: updatedUser.points,  // Updated points (previous + new QR code points)
      userHistory: userHistory,  // New user history entry
      userName: updatedUser.name,  // User's name (or any other important user data)
    });
  } catch (error: any) {
    console.error('Error in QR code scan:', error.message);
    return res.status(500).json({
      message: 'Server error while scanning QR code. Please try again later.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
