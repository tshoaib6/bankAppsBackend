import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import * as QRCodeService from '../services/qrCodeService';

// Create a new QR Code
export const createQRCode = async (req: Request, res: Response): Promise<any> => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ message: 'Authorization token required' });

      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      const userId = decoded.userId;

      const { code, points, isUsed } = req.body;

      // Input validation
      if (!code || typeof points !== 'number' || typeof isUsed !== 'boolean') {
        return res.status(400).json({
          message: 'Invalid input. Ensure "code" is a string, "points" is a number, and "isUsed" is a boolean.',
        });
      }

      const qrCodeData = { code, points, isUsed, createdBy: userId };
      const qrCode = await QRCodeService.createQRCode(qrCodeData);

      return res.status(201).json({ message: 'QR Code created successfully', qrCode });
    } catch (error) {
      return res.status(500).json({
        message: 'Server error while creating QR code. Please try again later.',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
};

// Get all QR Codes
export const getAllQRCodes = async (_req: Request, res: Response): Promise<any> => {
  try {
    const qrCodes = await QRCodeService.getAllQRCodes();
    return res.status(200).json({ qrCodes, message: 'QR Codes fetched successfully' });
  } catch (error) {
    return res.status(500).json({
      message: 'Server error while fetching QR codes. Please try again later.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get QR Code by ID
export const getQRCodeById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { qrCodeId } = req.params;
    const qrCode = await QRCodeService.getQRCodeById(qrCodeId);

    if (!qrCode) {
      return res.status(404).json({ message: 'QR Code not found' });
    }

    return res.status(200).json({ qrCode, message: 'QR Code fetched successfully' });
  } catch (error) {
    return res.status(500).json({
      message: 'Server error while fetching QR code. Please try again later.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Update QR Code
export const updateQRCode = async (req: Request, res: Response): Promise<any> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Authorization token required' });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.userId;

    const { qrCodeId } = req.params;
    const { code, points, isUsed } = req.body;

    // Input validation
    if (!code || typeof points !== 'number' || typeof isUsed !== 'boolean') {
      return res.status(400).json({
        message: 'Invalid input. Ensure "code" is a string, "points" is a number, and "isUsed" is a boolean.',
      });
    }

    const qrCode = await QRCodeService.getQRCodeById(qrCodeId);

    if (!qrCode) {
      return res.status(404).json({ message: 'QR Code not found' });
    }

    // Check if the user is authorized to update the QR Code
    if (qrCode.createdBy.toString() !== userId) {
      return res.status(403).json({
        message: 'You are not authorized to update this QR Code.',
      });
    }

    const updatedQRCode = await QRCodeService.updateQRCode(qrCodeId, { code, points, isUsed });

    return res.status(200).json({ message: 'QR Code updated successfully', updatedQRCode });
  } catch (error) {
    return res.status(500).json({
      message: 'Server error while updating QR code. Please try again later.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Delete QR Code
export const deleteQRCode = async (req: Request, res: Response): Promise<any> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Authorization token required' });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.userId;

    const { qrCodeId } = req.params;
    const qrCode = await QRCodeService.getQRCodeById(qrCodeId);

    if (!qrCode) {
      return res.status(404).json({ message: 'QR Code not found' });
    }

    // Check if the user is authorized to delete the QR Code
    if (qrCode.createdBy.toString() !== userId) {
      return res.status(403).json({
        message: 'You are not authorized to delete this QR Code.',
      });
    }

    await QRCodeService.deleteQRCode(qrCodeId);

    return res.status(200).json({ message: 'QR Code deleted successfully' });
  } catch (error) {
    return res.status(500).json({
      message: 'Server error while deleting QR code. Please try again later.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
