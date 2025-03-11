"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const promotionController_1 = require("../controllers/promotionController");
const router = express_1.default.Router();
router.post('/createPromotion', promotionController_1.createPromotion);
router.get('/getPromotions', promotionController_1.getPromotions);
router.get('/getPromotionById/:promotionId', promotionController_1.getPromotionById);
router.put('/updatePromotion/:promotionId', promotionController_1.updatePromotion);
router.delete('/deletePromotion/:promotionId', promotionController_1.deletePromotion);
exports.default = router;
