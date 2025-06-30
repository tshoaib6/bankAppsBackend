import express from 'express';
import {createPromotion,getPromotions,getPromotionById,updatePromotion,deletePromotion, getPromotionsByBrandId} from '../controllers/promotionController';

const router = express.Router();

router.post('/createPromotion', createPromotion);

router.get('/getPromotions', getPromotions);

router.get('/getPromotionById/:promotionId', getPromotionById);

router.put('/updatePromotion/:promotionId', updatePromotion);

router.delete('/deletePromotion/:promotionId', deletePromotion);

router.get('/getPromotionsByBrandId/:brandId', getPromotionsByBrandId);

export default router;
