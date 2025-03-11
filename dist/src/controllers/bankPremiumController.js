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
exports.getBankPremiumById = exports.getAllBankPremiums = exports.deleteBankPremium = exports.updateBankPremium = exports.createBankPremium = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bankPremiumService_1 = __importDefault(require("../services/bankPremiumService"));
const cloudinary_1 = require("../utils/cloudinary");
const createBankPremium = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        if (!token)
            return res.status(401).json({ message: 'Authorization token required' });
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        const { title, description, points_required, start_date, end_date, active } = req.body;
        if (!req.file)
            return res.status(400).json({ message: 'Image is required' });
        const imageUrl = yield (0, cloudinary_1.uploadToCloudinary)(req.file.buffer, 'bankpremium_images');
        const bankPremiumData = {
            title,
            description,
            points_required,
            start_date: new Date(start_date),
            end_date: new Date(end_date),
            image_url: imageUrl,
            active,
            enrolled_users: [],
        };
        const newBankPremium = yield bankPremiumService_1.default.createBankPremium(userId, bankPremiumData);
        return res.status(201).json({
            message: 'BankPremium created successfully',
            bankPremium: newBankPremium,
        });
    }
    catch (error) {
        console.error('Error creating BankPremium:', error);
        return res.status(500).json({ message: 'An error occurred while creating BankPremium', error: error.message });
    }
});
exports.createBankPremium = createBankPremium;
const updateBankPremium = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bankPremiumId } = req.params;
        const updates = req.body;
        if (req.file) {
            const imageUrl = yield (0, cloudinary_1.uploadToCloudinary)(req.file.buffer, 'bankpremium_images');
            updates.image_url = imageUrl;
        }
        const updatedBankPremium = yield bankPremiumService_1.default.updateBankPremium(bankPremiumId, updates);
        return res.status(200).json({
            message: 'BankPremium updated successfully',
            bankPremium: updatedBankPremium,
        });
    }
    catch (error) {
        console.error('Error updating BankPremium:', error);
        return res.status(500).json({ message: 'An error occurred while updating BankPremium', error: error.message });
    }
});
exports.updateBankPremium = updateBankPremium;
const deleteBankPremium = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { bankPremiumId } = req.params;
        const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        if (!token)
            return res.status(401).json({ message: 'Authorization token required' });
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        const bankPremium = yield bankPremiumService_1.default.deleteBankPremium(bankPremiumId);
        if (!bankPremium) {
            return res.status(404).json({ message: 'BankPremium not found' });
        }
        return res.status(200).json({
            message: 'BankPremium deleted successfully',
            bankPremium: bankPremium,
        });
    }
    catch (error) {
        console.error('Error deleting BankPremium:', error);
        return res.status(500).json({ message: 'An error occurred while deleting BankPremium', error: error.message });
    }
});
exports.deleteBankPremium = deleteBankPremium;
const getAllBankPremiums = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bankPremiums = yield bankPremiumService_1.default.getAllBankPremiums();
        if (!bankPremiums || bankPremiums.length === 0) {
            return res.status(404).json({ message: 'No BankPremiums found' });
        }
        return res.status(200).json({
            message: 'BankPremiums fetched successfully',
            bankPremiums,
        });
    }
    catch (error) {
        console.error('Error fetching BankPremiums:', error);
        return res.status(500).json({ message: 'An error occurred while fetching BankPremiums', error: error.message });
    }
});
exports.getAllBankPremiums = getAllBankPremiums;
const getBankPremiumById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bankPremiumId } = req.params;
        const bankPremium = yield bankPremiumService_1.default.getBankPremiumById(bankPremiumId);
        if (!bankPremium) {
            return res.status(404).json({ message: 'BankPremium not found' });
        }
        return res.status(200).json({
            message: 'BankPremium fetched successfully',
            bankPremium,
        });
    }
    catch (error) {
        console.error('Error fetching BankPremium:', error);
        return res.status(500).json({ message: 'An error occurred while fetching BankPremium', error: error.message });
    }
});
exports.getBankPremiumById = getBankPremiumById;
