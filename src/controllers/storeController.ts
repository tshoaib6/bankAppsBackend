import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import StoreService from '../services/storeService'

export const createStore = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    if (!token)
      return res.status(401).json({ message: 'Authorization token required' })

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!)
    const userId = decoded.userId

    const { storeName, description, longitude, latitude } = req.body

    if (!storeName || !description || !longitude || !latitude) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    const storeData = {
      storeName,
      description,
      location: { longitude, latitude },
      createdBy: userId
    }

    const newStore = await StoreService.createStore(storeData)

    return res.status(201).json({
      store: newStore,
      message: 'Store created successfully'
    })
  } catch (error) {
    console.error('Error creating store:', error)
    return res
      .status(500)
      .json({ message: 'Server error while creating store' })
  }
}

export const getStores = async (_req: Request, res: Response): Promise<any> => {
  try {
    const stores = await StoreService.getStores()

    return res.status(200).json({
      stores,
      message: 'Stores fetched successfully'
    })
  } catch (error) {
    console.error('Error fetching stores:', error)
    return res
      .status(500)
      .json({ message: 'Server error while fetching stores' })
  }
}

export const getStoreById = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { storeId } = req.params

    const store = await StoreService.getStoreById(storeId)

    if (!store) {
      return res.status(404).json({ message: 'Store not found' })
    }

    return res.status(200).json({
      store,
      message: 'Store fetched successfully'
    })
  } catch (error) {
    console.error('Error fetching store:', error)
    return res
      .status(500)
      .json({ message: 'Server error while fetching store' })
  }
}

export const updateStore = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { storeId } = req.params
    const updates = req.body

    const token = req.header('Authorization')?.replace('Bearer ', '')
    if (!token)
      return res.status(401).json({ message: 'Authorization token required' })

    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!)
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          message: 'Your session has expired. Please log in again.',
          expiredAt: error.expiredAt
        })
      }
      return res.status(401).json({ message: 'Invalid token' })
    }

    const userId = decoded.userId

    const existingStore = await StoreService.getStoreById(storeId)
    if (!existingStore) {
      return res.status(404).json({ message: 'Store not found' })
    }

    if (existingStore.createdBy.toString() !== userId) {
      return res
        .status(403)
        .json({ message: 'You are not authorized to update this store' })
    }

    const updatedStore = await StoreService.updateStore(storeId, updates)

    return res.status(200).json({
      store: updatedStore,
      message: 'Store updated successfully'
    })
  } catch (error) {
    console.error('Error updating store:', error)
    return res
      .status(500)
      .json({ message: 'Server error while updating store' })
  }
}

export const deleteStore = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { storeId } = req.params

    const token = req.header('Authorization')?.replace('Bearer ', '')
    if (!token)
      return res.status(401).json({ message: 'Authorization token required' })

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!)
    const userId = decoded.userId

    const existingStore = await StoreService.getStoreById(storeId)
    if (!existingStore) {
      return res.status(404).json({ message: 'Store not found' })
    }

    if (existingStore.createdBy.toString() !== userId) {
      return res
        .status(403)
        .json({ message: 'You are not authorized to delete this store' })
    }

    await StoreService.deleteStore(storeId)

    return res.status(200).json({ message: 'Store deleted successfully' })
  } catch (error) {
    console.error('Error deleting store:', error)
    return res
      .status(500)
      .json({ message: 'Server error while deleting store' })
  }
}
