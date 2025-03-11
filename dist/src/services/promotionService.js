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
exports.deletePromotion = exports.updatePromotion = exports.getPromotionById = exports.getPromotions = exports.createPromotion = void 0;
const promotion_model_1 = __importDefault(require("../models/promotion.model"));
const createPromotion = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const promotion = new promotion_model_1.default(data);
        yield promotion.save();
        return promotion;
    }
    catch (error) {
        throw new Error('Error creating promotion');
    }
});
exports.createPromotion = createPromotion;
const getPromotions = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield promotion_model_1.default.find();
    }
    catch (error) {
        throw new Error('Error fetching promotions');
    }
});
exports.getPromotions = getPromotions;
const getPromotionById = (promotionId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield promotion_model_1.default.findById(promotionId);
    }
    catch (error) {
        throw new Error('Error fetching promotion by ID');
    }
});
exports.getPromotionById = getPromotionById;
const updatePromotion = (promotionId, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield promotion_model_1.default.findByIdAndUpdate(promotionId, data, { new: true });
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
