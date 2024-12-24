import { Router } from 'express';
import { createStore, getStores, updateStore, deleteStore,getStoreById } from '../controllers/storeController';

const router = Router();

router.post('/createStore', createStore);

router.get('/getStore', getStores);

router.put('/updateStore/:storeId', updateStore);

router.delete('/deleteStore/:storeId', deleteStore);

router.get('/getStoreById/:storeId', getStoreById);


export default router;
