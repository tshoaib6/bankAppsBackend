import { Router } from 'express';
import { createStore, getStores, updateStore, deleteStore } from '../controllers/storeController';

const router = Router();

// Create a new store
router.post('/createStore', createStore);

// Get all stores
router.get('/getStore', getStores);

// Update a store
router.put('/updateStore:storeId', updateStore);

// Delete a store
router.delete('/deleteStore:storeId', deleteStore);

export default router;
