import { Router } from 'express';
import {
  createBrand,
  getAllBrands,
  getBrandById,
  updateBrand,
  updateBrandStatus,
  deleteBrand,
} from '../controllers/brand.controller';

const router = Router();

// POST /api/brands → Create
router.post('/Createbrand', createBrand);

// GET /api/brands → All brands
router.get('/getAllBrands', getAllBrands);

// GET /api/brands/:id → Get single brand
router.get('/getBrandById/:id', getBrandById);

// PUT /api/brands/:id → Update brand
router.put('/updateBrand/:id', updateBrand);

// PATCH /api/brands/:id/status → Update only status
router.patch('/updateBrandStatus/:id/status', updateBrandStatus);

// DELETE /api/brands/:id → Delete brand
router.delete('/deleteBrand/:id', deleteBrand);

export default router;
