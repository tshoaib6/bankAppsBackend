import express from 'express';
import * as brandController from '../controllers/brand.controller';

const router = express.Router();

// POST /api/brands - Create a new brand
router.post('/createBrand', brandController.createBrand);

// GET /api/brands - Get all brands
router.get('/getAllBrands', brandController.getAllBrands);

// GET /api/brands/:id - Get brand by ID
router.get('/getBrandById:id', brandController.getBrandById);

// PUT /api/brands/:id - Update a brand
router.put('/updateBrandById:id', brandController.updateBrand);

// DELETE /api/brands/:id - Delete a brand
router.delete('/deleteBrandById:id', brandController.deleteBrand);

export default router;
