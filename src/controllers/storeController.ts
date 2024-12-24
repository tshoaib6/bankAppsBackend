import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import StoreService from '../services/storeService';

// Create a new store
export const createStore = async (req: Request, res: Response): Promise<any> => {
  try {
    // Check for Authorization token
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Authorization token required' });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.userId;

    // Get data from request body
    const { storeName, description, longitude, latitude } = req.body;

    // Validate input fields
    if (!storeName || !description || !longitude || !latitude) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Store data to be created
    const storeData = {
      storeName,
      description,
      location: { longitude, latitude },
      createdBy: userId,
    };

    // Call the service to create a new store
    const newStore = await StoreService.createStore(storeData);

    // Return success response
    return res.status(201).json({
      store: newStore,
      message: 'Store created successfully',
    });
  } catch (error) {
    console.error('Error creating store:', error);
    return res.status(500).json({ message: 'Server error while creating store' });
  }
};

// Get all stores
export const getStores = async (_req: Request, res: Response): Promise<any> => {
  try {
    // Fetch stores from service
    const stores = await StoreService.getStores();

    // Return success response
    return res.status(200).json({
      stores,
      message: 'Stores fetched successfully',
    });
  } catch (error) {
    console.error('Error fetching stores:', error);
    return res.status(500).json({ message: 'Server error while fetching stores' });
  }
};

// Get a store by ID
export const getStoreById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { storeId } = req.params;

    // Fetch the store by ID
    const store = await StoreService.getStoreById(storeId);

    // If store not found
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Return store data on success
    return res.status(200).json({
      store,
      message: 'Store fetched successfully',
    });
  } catch (error) {
    console.error('Error fetching store:', error);
    return res.status(500).json({ message: 'Server error while fetching store' });
  }
};

// Update a store
export const updateStore = async (req: Request, res: Response): Promise<any> => {
  try {
    const { storeId } = req.params;
    const updates = req.body;

    // Check for Authorization token
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Authorization token required' });

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          message: 'Your session has expired. Please log in again.',
          expiredAt: error.expiredAt, // Optional: provide the expired time for frontend use
        });
      }
      return res.status(401).json({ message: 'Invalid token' });
    }

    const userId = decoded.userId;

    // Fetch the store by ID to check if it exists
    const existingStore = await StoreService.getStoreById(storeId);
    if (!existingStore) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Check if the user is authorized to update this store
    if (existingStore.createdBy.toString() !== userId) {
      return res.status(403).json({ message: 'You are not authorized to update this store' });
    }

    // Call the service to update the store
    const updatedStore = await StoreService.updateStore(storeId, updates);

    // Return success response
    return res.status(200).json({
      store: updatedStore,
      message: 'Store updated successfully',
    });
  } catch (error) {
    console.error('Error updating store:', error);
    return res.status(500).json({ message: 'Server error while updating store' });
  }
};

// Delete a store
export const deleteStore = async (req: Request, res: Response): Promise<any> => {
  try {
    const { storeId } = req.params;

    // Check for Authorization token
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Authorization token required' });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.userId;

    // Fetch the store by ID to check if it exists
    const existingStore = await StoreService.getStoreById(storeId);
    if (!existingStore) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Check if the user is authorized to delete this store
    if (existingStore.createdBy.toString() !== userId) {
      return res.status(403).json({ message: 'You are not authorized to delete this store' });
    }

    // Call the service to delete the store
    await StoreService.deleteStore(storeId);

    // Return success response
    return res.status(200).json({ message: 'Store deleted successfully' });
  } catch (error) {
    console.error('Error deleting store:', error);
    return res.status(500).json({ message: 'Server error while deleting store' });
  }
};
