import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { handleQRCodeScan } from '../services/qrCodeScanService';

export const scanQRCode = async (req: Request, res: Response): Promise<any> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token)
      return res.status(401).json({ message: 'Authorization token required' });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.userId;

    const { scannedCode } = req.body;
    if (!scannedCode) {
      return res.status(400).json({ message: 'Scanned code is required' });
    }

    const { updatedUser, userHistory } = await handleQRCodeScan(userId, scannedCode);

    return res.status(200).json({
      message: 'QR Code scanned successfully. Points added to your account.',
      userId: (updatedUser as any)._id,  // safely access _id
      userPoints: updatedUser.points,
      userHistory,
      userName: updatedUser.name,
    });
  } catch (error: any) {
    console.error('Error in QR code scan:', error.message);
    return res.status(500).json({
      message: 'Server error while scanning QR code. Please try again later.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
