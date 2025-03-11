"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const PromotionService = __importStar(require("../services/promotionService"));
const cloudinary_1 = require("../utils/cloudinary");
const multer_1 = __importDefault(require("multer"));
const store_model_1 = __importDefault(require("../models/store.model"));
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage }).single('image');
const validateStoreIds = (storeIds) => __awaiter(void 0, void 0, void 0, function* () {
    const validStores = yield store_model_1.default.find({ _id: { $in: storeIds } });
    return validStores.length === storeIds.length;
});
const createPromotion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        if (!token)
            return res.status(401).json({ message: 'Authorization token required' });
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        upload(req, res, (err) => __awaiter(void 0, void 0, void 0, function* () {
            if (err instanceof multer_1.default.MulterError) {
                return res
                    .status(400)
                    .json({ message: 'Image upload error', error: err.message });
            }
            else if (err) {
                return res
                    .status(500)
                    .json({ message: 'Server error', error: err.message });
            }
            const imageUrl = req.file
                ? yield (0, cloudinary_1.uploadToCloudinary)(req.file.buffer, 'promotions')
                : '';
            const { title, description, points_required, start_date, end_date, stores } = req.body;
            const storeIds = stores.split(','); // Assuming stores are passed as comma-separated IDs
            const isValidStores = yield validateStoreIds(storeIds);
            if (!isValidStores) {
                return res.status(400).json({ message: 'Invalid store IDs provided' });
            }
            const promotionData = {
                title,
                description,
                points_required,
                start_date,
                end_date,
                image_url: imageUrl,
                stores: storeIds,
                createdBy: userId
            };
            const promotion = yield PromotionService.createPromotion(promotionData);
            return res
                .status(201)
                .json({ message: 'Promotion created successfully', promotion });
        }));
    }
    catch (error) {
        console.error('Error creating promotion:', error);
        return res
            .status(500)
            .json({ message: 'Server error while creating promotion' });
    }
});
exports.createPromotion = createPromotion;
const getPromotions = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const promotions = yield PromotionService.getPromotions();
        return res
            .status(200)
            .json({ promotions, message: 'Promotions fetched successfully' });
    }
    catch (error) {
        console.error('Error fetching promotions:', error);
        return res
            .status(500)
            .json({ message: 'Server error while fetching promotions' });
    }
});
exports.getPromotions = getPromotions;
const getPromotionById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { promotionId } = req.params;
        const promotion = yield PromotionService.getPromotionById(promotionId);
        if (!promotion) {
            return res.status(404).json({ message: 'Promotion not found' });
        }
        return res
            .status(200)
            .json({ promotion, message: 'Promotion fetched successfully' });
    }
    catch (error) {
        console.error('Error fetching promotion:', error);
        return res
            .status(500)
            .json({ message: 'Server error while fetching promotion' });
    }
});
exports.getPromotionById = getPromotionById;
const updatePromotion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        if (!token)
            return res.status(401).json({ message: 'Authorization token required' });
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        const { promotionId } = req.params;
        upload(req, res, (err) => __awaiter(void 0, void 0, void 0, function* () {
            if (err instanceof multer_1.default.MulterError) {
                return res
                    .status(400)
                    .json({ message: 'Image upload error', error: err.message });
            }
            else if (err) {
                return res
                    .status(500)
                    .json({ message: 'Server error', error: err.message });
            }
            let imageUrl = '';
            if (req.file) {
                imageUrl = yield (0, cloudinary_1.uploadToCloudinary)(req.file.buffer, 'promotions');
            }
            const updates = req.body;
            const updateData = Object.assign(Object.assign({}, updates), (imageUrl && { image_url: imageUrl }));
            if (updateData.stores) {
                const storeIds = updateData.stores.split(',');
                const isValidStores = yield validateStoreIds(storeIds);
                if (!isValidStores) {
                    return res.status(400).json({ message: 'Invalid store IDs provided' });
                }
                updateData.stores = storeIds;
            }
            const updatedPromotion = yield PromotionService.updatePromotion(promotionId, updateData);
            if (!updatedPromotion) {
                return res.status(404).json({ message: 'Promotion not found' });
            }
            return res
                .status(200)
                .json({
                promotion: updatedPromotion,
                message: 'Promotion updated successfully'
            });
        }));
    }
    catch (error) {
        console.error('Error updating promotion:', error);
        return res
            .status(500)
            .json({ message: 'Server error while updating promotion' });
    }
});
exports.updatePromotion = updatePromotion;
const deletePromotion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        if (!token)
            return res.status(401).json({ message: 'Authorization token required' });
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        const { promotionId } = req.params;
        const deletedPromotion = yield PromotionService.deletePromotion(promotionId);
        if (!deletedPromotion) {
            return res.status(404).json({ message: 'Promotion not found' });
        }
        return res.status(200).json({ message: 'Promotion deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting promotion:', error);
        return res
            .status(500)
            .json({ message: 'Server error while deleting promotion' });
    }
});
exports.deletePromotion = deletePromotion;
