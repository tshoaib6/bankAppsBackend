"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPromotionsByBrandId = exports.deletePromotion = exports.updatePromotion = exports.getPromotionById = exports.getPromotions = exports.createPromotion = void 0;
const promotion_model_1 = __importDefault(require("../models/promotion.model"));
// Create promotion with optional brand
const createPromotion = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const promotion = new promotion_model_1.default(data); // includes optional brand
        yield promotion.save();
        return promotion;
    }
    catch (error) {
        console.error('Error in createPromotion service:', error.message, error);
        throw new Error('Error creating promotion');
    }
});
exports.createPromotion = createPromotion;
// Get all promotions (across all brands)
const getPromotions = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield promotion_model_1.default.find().populate('brand'); // populate for visibility
    }
    catch (error) {
        throw new Error('Error fetching promotions');
    }
});
exports.getPromotions = getPromotions;
// ✅ NEW: Get promotions by brand ID
// export const getPromotionsByBrand = async (brandId: string): Promise<IPromotion[]> => {
//   try {
//     return await Promotion.find({ brand: brandId }).populate('brand');
//   } catch (error) {
//     throw new Error('Error fetching promotions by brand');
//   }
// };
const getPromotionById = (promotionId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield promotion_model_1.default.findById(promotionId).populate('brand');
    }
    catch (error) {
        throw new Error('Error fetching promotion by ID');
    }
});
exports.getPromotionById = getPromotionById;
const updatePromotion = (promotionId, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield promotion_model_1.default.findByIdAndUpdate(promotionId, data, { new: true }).populate('brand');
    }
    catch (error) {
        console.error('Error updating promotion:', error);
        throw new Error('Error updating promotion');
    }
});
exports.updatePromotion = updatePromotion;
const deletePromotion = (promotionId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield promotion_model_1.default.findByIdAndDelete(promotionId);
    }
    catch (error) {
        throw new Error('Error deleting promotion');
    }
});
exports.deletePromotion = deletePromotion;
const getPromotionsByBrandId = (brandId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield promotion_model_1.default.find({ brand: brandId }).populate('brand');
    }
    catch (error) {
        throw new Error('Error fetching promotions by brand');
    }
});
exports.getPromotionsByBrandId = getPromotionsByBrandId;
