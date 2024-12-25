import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import * as PromotionService from '../services/promotionService';
import { uploadToCloudinary } from '../utils/cloudinary';
import multer from 'multer';
import Store from '../models/store.model'; // Import the Store model

// Multer setup for image upload (in-memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage }).single('image');

// Helper function to validate store IDs
const validateStoreIds = async (storeIds: string[]): Promise<boolean> => {
  const validStores = await Store.find({ _id: { $in: storeIds } });
  return validStores.length === storeIds.length;
};

// Create a promotion
export const createPromotion = async (req: Request, res: Response): Promise<any> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Authorization token required' });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.userId;

    // Handle image upload
    upload(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: 'Image upload error', error: err.message });
      } else if (err) {
        return res.status(500).json({ message: 'Server error', error: err.message });
      }

      const imageUrl = req.file ? await uploadToCloudinary(req.file.buffer, 'promotions') : '';

      // Prepare promotion data
      const { title, description, points_required, start_date, end_date, stores } = req.body;
      const storeIds = stores.split(','); // Assuming stores are passed as comma-separated IDs

      // Validate store IDs
      const isValidStores = await validateStoreIds(storeIds);
      if (!isValidStores) {
        return res.status(400).json({ message: 'Invalid store IDs provided' });
      }

      const promotionData = {
        title,
        description,
        points_required,
        start_date,
        end_date,
        image_url: imageUrl,
        stores: storeIds,
        createdBy: userId, // Set the userId from token as createdBy
      };

      const promotion = await PromotionService.createPromotion(promotionData);

      return res.status(201).json({ message: 'Promotion created successfully', promotion });
    });
  } catch (error) {
    console.error('Error creating promotion:', error);
    return res.status(500).json({ message: 'Server error while creating promotion' });
  }
};
// Get all promotions
export const getPromotions = async (_req: Request, res: Response): Promise<any> => {
    try {
      const promotions = await PromotionService.getPromotions()
  
      return res.status(200).json({ promotions, message: 'Promotions fetched successfully' });
    } catch (error) {
      console.error('Error fetching promotions:', error);
      return res.status(500).json({ message: 'Server error while fetching promotions' });
    }
  };
  
  // Get a promotion by ID
  export const getPromotionById = async (req: Request, res: Response): Promise<any> => {
    try {
      const { promotionId } = req.params;
      const promotion = await PromotionService.getPromotionById(promotionId)
  
      if (!promotion) {
        return res.status(404).json({ message: 'Promotion not found' });
      }
  
      return res.status(200).json({ promotion, message: 'Promotion fetched successfully' });
    } catch (error) {
      console.error('Error fetching promotion:', error);
      return res.status(500).json({ message: 'Server error while fetching promotion' });
    }
  };
  
// Update a promotion
export const updatePromotion = async (req: Request, res: Response): Promise<any> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Authorization token required' });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.userId;

    const { promotionId } = req.params;
    const updates = req.body;

    // Handle image upload
    upload(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: 'Image upload error', error: err.message });
      } else if (err) {
        return res.status(500).json({ message: 'Server error', error: err.message });
      }

      let imageUrl = '';
      if (req.file) {
        imageUrl = await uploadToCloudinary(req.file.buffer, 'promotions');
      }

      const promotionData = { ...updates, image_url: imageUrl || updates.image_url };

      // Validate store IDs if they are being updated
      if (promotionData.stores) {
        const storeIds = promotionData.stores.split(',');
        const isValidStores = await validateStoreIds(storeIds);
        if (!isValidStores) {
          return res.status(400).json({ message: 'Invalid store IDs provided' });
        }
        promotionData.stores = storeIds;
      }

      const updatedPromotion = await PromotionService.updatePromotion(promotionId, promotionData);

      if (!updatedPromotion) {
        return res.status(404).json({ message: 'Promotion not found' });
      }

      return res.status(200).json({ promotion: updatedPromotion, message: 'Promotion updated successfully' });
    });
  } catch (error) {
    console.error('Error updating promotion:', error);
    return res.status(500).json({ message: 'Server error while updating promotion' });
  }
};
export const deletePromotion = async (req: Request, res: Response): Promise<any> => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ message: 'Authorization token required' });
  
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      const userId = decoded.userId;
  
      const { promotionId } = req.params;
      const deletedPromotion = await PromotionService.deletePromotion(promotionId);
  
      if (!deletedPromotion) {
        return res.status(404).json({ message: 'Promotion not found' });
      }
  
      return res.status(200).json({ message: 'Promotion deleted successfully' });
    } catch (error) {
      console.error('Error deleting promotion:', error);
      return res.status(500).json({ message: 'Server error while deleting promotion' });
    }
  };