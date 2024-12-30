import QRCode from '../models/QRCode.model';
import { IQRCode } from '../models/QRCode.model';

// Create a new QR Code
export const createQRCode = async (data: any): Promise<IQRCode> => {
    try {
      const { code, points, isUsed, createdBy } = data;
  
      // Validate required fields
      if (!code || typeof points !== 'number' || typeof isUsed !== 'boolean') {
        throw new Error('Invalid input: code (string), points (number), and isUsed (boolean) are required');
      }
  
      // Create a new QRCode instance with the provided data
      const qrCode = new QRCode({ code, points, isUsed, createdBy });
  
      // Save the QR code to the database
      await qrCode.save();
  
      return qrCode;
    } catch (error) {
      console.error('Error creating QR code:', error);
      throw new Error(error instanceof Error ? error.message : 'Error creating QR code');
    }
  };
  
// Get all QR Codes
export const getAllQRCodes = async (): Promise<IQRCode[]> => {
  try {
    return await QRCode.find();
  } catch (error) {
    throw new Error('Error fetching QR codes');
  }
};

// Get QR Code by ID
export const getQRCodeById = async (qrCodeId: string): Promise<IQRCode | null> => {
  try {
    return await QRCode.findById(qrCodeId);
  } catch (error) {
    throw new Error('Error fetching QR code');
  }
};

// Update a QR Code
export const updateQRCode = async (qrCodeId: string, data: any, userId: string): Promise<IQRCode | null> => {
  try {
    // Only allow the creator of the QR code to update it
    const qrCode = await QRCode.findById(qrCodeId);
    if (!qrCode) {
      throw new Error('QR Code not found');
    }

    if (qrCode.createdBy.toString() !== userId) {
      throw new Error('You are not authorized to update this QR code');
    }

    // Update the QR code fields
    qrCode.code = data.code || qrCode.code;
    qrCode.points = data.points || qrCode.points;
    qrCode.isUsed = data.isUsed !== undefined ? data.isUsed : qrCode.isUsed;

    await qrCode.save();
    return qrCode;
  } catch (error) {
    throw new Error('Error updating QR code');
  }
};
export const deleteQRCode = async (qrCodeId: string, userId: string): Promise<IQRCode | null> => {
    try {
      // Only allow the creator of the QR code to delete it
      const qrCode = await QRCode.findById(qrCodeId);
      if (!qrCode) {
        throw new Error('QR Code not found');
      }
  
      if (qrCode.createdBy.toString() !== userId) {
        throw new Error('You are not authorized to delete thist QR code');
      }
  
      // Use deleteOne instead of remove
      await qrCode.deleteOne();
      return qrCode;
    } catch (error) {
      throw new Error('Error deleting QR code');
    }
  };