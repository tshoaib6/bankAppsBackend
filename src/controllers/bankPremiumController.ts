import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import BankPremiumService from '../services/bankPremiumService';
import { uploadToCloudinary } from '../utils/cloudinary';

export const createBankPremium = async (req: Request, res: Response): Promise<any> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Authorization token required' });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.userId;

    const { title, description, points_required, start_date, end_date, active } = req.body;

    if (!req.file) return res.status(400).json({ message: 'Image is required' });

    const imageUrl = await uploadToCloudinary(req.file.buffer, 'bankpremium_images');

    const bankPremiumData = {
      title,
      description,
      points_required,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      image_url: imageUrl,
      active,
      enrolled_users: [],
    };

    const newBankPremium = await BankPremiumService.createBankPremium(userId, bankPremiumData);
    
    return res.status(201).json({
      message: 'BankPremium created successfully',
      bankPremium: newBankPremium,
    });
  } catch (error:any) {
    console.error('Error creating BankPremium:', error);
    return res.status(500).json({ message: 'An error occurred while creating BankPremium', error: error.message });
  }
};
export const updateBankPremium = async (req: Request, res: Response): Promise<any> => {
  try {
    const { bankPremiumId } = req.params;
    const updates = req.body;

    if (req.file) {
      const imageUrl = await uploadToCloudinary(req.file.buffer, 'bankpremium_images');
      updates.image_url = imageUrl;
    }

    const updatedBankPremium = await BankPremiumService.updateBankPremium(bankPremiumId, updates);

    return res.status(200).json({
      message: 'BankPremium updated successfully',
      bankPremium: updatedBankPremium,
    });
  } catch (error: any) {
    console.error('Error updating BankPremium:', error);
    return res.status(500).json({ message: 'An error occurred while updating BankPremium', error: error.message });
  }
};


export const deleteBankPremium = async (req: Request, res: Response): Promise<any> => {
  try {
    const { bankPremiumId } = req.params;
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Authorization token required' });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.userId;

    const bankPremium = await BankPremiumService.deleteBankPremium(bankPremiumId);

    if (!bankPremium) {
      return res.status(404).json({ message: 'BankPremium not found' });
    }

    return res.status(200).json({
      message: 'BankPremium deleted successfully',
      bankPremium: bankPremium,
    });
  } catch (error:any) {
    console.error('Error deleting BankPremium:', error);
    return res.status(500).json({ message: 'An error occurred while deleting BankPremium', error: error.message });
  }
};

export const getAllBankPremiums = async (req: Request, res: Response): Promise<any> => {
  try {
    const bankPremiums = await BankPremiumService.getAllBankPremiums();

    if (!bankPremiums || bankPremiums.length === 0) {
      return res.status(404).json({ message: 'No BankPremiums found' });
    }

    return res.status(200).json({
      message: 'BankPremiums fetched successfully',
      bankPremiums,
    });
  } catch (error:any) {
    console.error('Error fetching BankPremiums:', error);
    return res.status(500).json({ message: 'An error occurred while fetching BankPremiums', error: error.message });
  }
};

export const getBankPremiumById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { bankPremiumId } = req.params;
    const bankPremium = await BankPremiumService.getBankPremiumById(bankPremiumId);

    if (!bankPremium) {
      return res.status(404).json({ message: 'BankPremium not found' });
    }

    return res.status(200).json({
      message: 'BankPremium fetched successfully',
      bankPremium,
    });
  } catch (error:any) {
    console.error('Error fetching BankPremium:', error);
    return res.status(500).json({ message: 'An error occurred while fetching BankPremium', error: error.message });
  }
};
