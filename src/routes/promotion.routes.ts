import express from 'express';
import {createPromotion,getPromotions,getPromotionById,updatePromotion,deletePromotion} from '../controllers/promotionController';

const router = express.Router();

// Create a promotion
router.post('/createPromotion', createPromotion);

// Get all promotions
router.get('/getPromotions', getPromotions);

// Get a promotion by ID
router.get('/getPromotionById/:promotionId', getPromotionById);

// Update a promotion
router.put('/updatePromotion/:promotionId', updatePromotion);

// Delete a promotion
router.delete('/deletePromotion/:promotionId', deletePromotion);

export default router;
