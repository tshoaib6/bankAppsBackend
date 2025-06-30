import { Router } from 'express';
import {
  createBrand,
  getAllBrands,
  getBrandById,
  updateBrand,
  updateBrandStatus,
  deleteBrand,
} from '../controllers/brand.controller';
import { upload } from '../middlewares/multer';

const router = Router();


router.post('/Createbrand', upload.single('image'), createBrand);
router.put('/updateBrand/:id', upload.single('image'), updateBrand);
// router.post('/Createbrand', createBrand);

router.get('/getAllBrands', getAllBrands);

router.get('/getBrandById/:id', getBrandById);

// router.put('/updateBrand/:id', updateBrand);

router.patch('/updateBrandStatus/:id/status', updateBrandStatus);

router.delete('/deleteBrand/:id', deleteBrand);

export default router;
