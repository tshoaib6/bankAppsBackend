import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import * as QRCodeService from '../services/qrCodeService';
import { IQRCode } from '../models/QRCode.model';

// Create a new QR Code
export const createQRCode = async (req: Request, res: Response): Promise<any> => {
    try {
      // Extract the token from the Authorization header
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ message: 'Authorization token required' });
  
      // Verify the token and get the user ID
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      const userId = decoded.userId;
  
      // Destructure the code, points, and isUsed fields from the request body
      const { code, points, isUsed } = req.body;
  
      // Check if all required fields are provided
      if (!code || typeof points !== 'number' || typeof isUsed !== 'boolean') {
        return res.status(400).json({ message: 'Invalid input: code (string), points (number), and isUsed (boolean) are required' });
      }
  
      // Prepare the data for QR Code creation
      const qrCodeData = { code, points, isUsed, createdBy: userId };
  
      // Create the QR code using the service
      const qrCode = await QRCodeService.createQRCode(qrCodeData);
  
      // Return success response
      return res.status(201).json({ message: 'QR Code created successfully', qrCode });
    } catch (error) {
      console.error('Error creating QR code:', error);
      return res.status(500).json({ message: 'Server error while creating QR code' });
    }
  };

// Get all QR Codes
export const getAllQRCodes = async (_req: Request, res: Response): Promise<any> => {
  try {
    const qrCodes = await QRCodeService.getAllQRCodes();
    return res.status(200).json({ qrCodes, message: 'QR Codes fetched successfully' });
  } catch (error) {
    console.error('Error fetching QR codes:', error);
    return res.status(500).json({ message: 'Server error while fetching QR codes' });
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
    console.error('Error fetching QR code:', error);
    return res.status(500).json({ message: 'Server error while fetching QR code' });
  }
};

// Update a QR Code
export const updateQRCode = async (req: Request, res: Response): Promise<any> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Authorization token required' });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.userId;

    const { qrCodeId } = req.params;
    const { code, points, isUsed } = req.body;

    const updatedQRCodeData = { code, points, isUsed };

    const updatedQRCode = await QRCodeService.updateQRCode(qrCodeId, updatedQRCodeData, userId);

    if (!updatedQRCode) {
      return res.status(404).json({ message: 'QR Code not found' });
    }

    return res.status(200).json({ updatedQRCode, message: 'QR Code updated successfully' });
  } catch (error) {
    console.error('Error updating QR code:', error);
    return res.status(500).json({ message: 'Server error while updating QR code' });
  }
};

// Delete a QR Code
export const deleteQRCode = async (req: Request, res: Response): Promise<any> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Authorization token required' });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.userId;

    const { qrCodeId } = req.params;
    const deletedQRCode = await QRCodeService.deleteQRCode(qrCodeId, userId);

    if (!deletedQRCode) {
      return res.status(404).json({ message: 'QR Code not found' });
    }

    return res.status(200).json({ message: 'QR Code deleted successfully' });
  } catch (error) {
    console.error('Error deleting QR code:', error);
    return res.status(500).json({ message: 'Server error while deleting QR code' });
  }
};
