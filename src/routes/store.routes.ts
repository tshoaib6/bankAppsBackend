import { Router } from 'express';
import { createStore, getStores, updateStore, deleteStore,getStoreById, getStoresByBrandId } from '../controllers/storeController';

const router = Router();

router.post('/createStore', createStore);

router.get('/getStore', getStores);

router.put('/updateStore/:storeId', updateStore);

router.delete('/deleteStore/:storeId', deleteStore);

router.get('/getStoreById/:storeId', getStoreById);

router.get('/getStoresByBrandId/:brandId', getStoresByBrandId);

export default router;
