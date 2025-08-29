import { Router } from 'express';
import { createStore, getStores, updateStore, deleteStore, getStoreById, uploadStores } from '../controllers/storeController';
import multer from "multer";
import path from "path";


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // folder where CSVs will be saved temporarily
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

const router = Router();

router.post('/createStore', createStore);

router.get('/getStore', getStores);

router.put('/updateStore/:storeId', updateStore);

router.delete('/deleteStore/:storeId', deleteStore);

router.get('/getStoreById/:storeId', getStoreById);

// router.get('/getStoresByBrandId/:brandId', getStoresByBrandId);
router.post("/importCSV", upload.single("file"), uploadStores);


export default router;
