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
exports.getAllRedemptionsController = exports.verifyBankPremiumCode = exports.redeemBankPremium = exports.getBankPremiumById = exports.getAllBankPremiums = exports.deleteBankPremium = exports.updateBankPremium = exports.createBankPremium = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bankPremiumService_1 = __importStar(require("../services/bankPremiumService"));
const cloudinary_1 = require("../utils/cloudinary");
/**
 * Create a new BankPremium
 */
const createBankPremium = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", "");
        if (!token)
            return res.status(401).json({ message: "Authorization token required" });
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        const { title, description, points_required, start_date, end_date, active, brand, } = req.body;
        if (!req.file)
            return res.status(400).json({ message: "Image is required" });
        const imageUrl = yield (0, cloudinary_1.uploadToCloudinary)(req.file.buffer, "bankpremium_images");
        const bankPremiumData = {
            title,
            description,
            points_required,
            start_date: new Date(start_date),
            end_date: new Date(end_date),
            image_url: imageUrl,
            active: active !== null && active !== void 0 ? active : true,
            enrolled_users: [],
            brand: brand || null,
        };
        const newBankPremium = yield bankPremiumService_1.default.createBankPremium(userId, bankPremiumData);
        return res.status(201).json({
            message: "BankPremium created successfully",
            bankPremium: newBankPremium,
        });
    }
    catch (error) {
        console.error("Error creating BankPremium:", error);
        return res.status(500).json({
            message: "An error occurred while creating BankPremium",
            error: error.message,
        });
    }
});
exports.createBankPremium = createBankPremium;
/**
 * Update an existing BankPremium
 */
const updateBankPremium = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bankPremiumId } = req.params;
        const updates = req.body;
        if (req.file) {
            const imageUrl = yield (0, cloudinary_1.uploadToCloudinary)(req.file.buffer, "bankpremium_images");
            updates.image_url = imageUrl;
        }
        const updatedBankPremium = yield bankPremiumService_1.default.updateBankPremium(bankPremiumId, updates);
        return res.status(200).json({
            message: "BankPremium updated successfully",
            bankPremium: updatedBankPremium,
        });
    }
    catch (error) {
        console.error("Error updating BankPremium:", error);
        return res.status(500).json({
            message: "An error occurred while updating BankPremium",
            error: error.message,
        });
    }
});
exports.updateBankPremium = updateBankPremium;
/**
 * Delete a BankPremium
 */
const deleteBankPremium = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { bankPremiumId } = req.params;
        const token = (_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", "");
        if (!token)
            return res.status(401).json({ message: "Authorization token required" });
        jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const bankPremium = yield bankPremiumService_1.default.deleteBankPremium(bankPremiumId);
        if (!bankPremium) {
            return res.status(404).json({ message: "BankPremium not found" });
        }
        return res.status(200).json({
            message: "BankPremium deleted successfully",
            bankPremium,
        });
    }
    catch (error) {
        console.error("Error deleting BankPremium:", error);
        return res.status(500).json({
            message: "An error occurred while deleting BankPremium",
            error: error.message,
        });
    }
});
exports.deleteBankPremium = deleteBankPremium;
/**
 * Get all BankPremiums
 */
const getAllBankPremiums = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bankPremiums = yield bankPremiumService_1.default.getAllBankPremiums();
        if (!bankPremiums || bankPremiums.length === 0) {
            return res.status(404).json({ message: "No BankPremiums found" });
        }
        return res.status(200).json({
            message: "BankPremiums fetched successfully",
            bankPremiums,
        });
    }
    catch (error) {
        console.error("Error fetching BankPremiums:", error);
        return res.status(500).json({
            message: "An error occurred while fetching BankPremiums",
            error: error.message,
        });
    }
});
exports.getAllBankPremiums = getAllBankPremiums;
/**
 * Get a BankPremium by ID
 */
const getBankPremiumById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bankPremiumId } = req.params;
        const bankPremium = yield bankPremiumService_1.default.getBankPremiumById(bankPremiumId);
        if (!bankPremium) {
            return res.status(404).json({ message: "BankPremium not found" });
        }
        return res.status(200).json({
            message: "BankPremium fetched successfully",
            bankPremium,
        });
    }
    catch (error) {
        console.error("Error fetching BankPremium:", error);
        return res.status(500).json({
            message: "An error occurred while fetching BankPremium",
            error: error.message,
        });
    }
});
exports.getBankPremiumById = getBankPremiumById;
/**
 * Redeem a BankPremium (User)
 */
const redeemBankPremium = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", "");
        if (!token)
            return res.status(401).json({ message: "Authorization token required" });
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        const { premiumId } = req.body;
        if (!premiumId) {
            return res.status(400).json({ message: "premiumId is required" });
        }
        const result = yield bankPremiumService_1.default.redeemBankPremiumService(userId, premiumId);
        return res.status(200).json(Object.assign({ message: "BankPremium redeemed successfully" }, result));
    }
    catch (error) {
        console.error("Error redeeming BankPremium:", error);
        // 🔹 if it's a known validation / user error, return 400
        if (error.message.includes("Insufficient points") ||
            error.message.includes("not found") ||
            error.message.includes("Invalid")) {
            return res.status(400).json({ message: error.message });
        }
        // 🔹 otherwise, internal server error
        return res.status(500).json({
            message: "An error occurred while redeeming BankPremium",
            error: error.message,
        });
    }
});
exports.redeemBankPremium = redeemBankPremium;
/**
 * Verify redemption code (Admin) → Mark as delivered
 */
const verifyBankPremiumCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code } = req.body;
        if (!code) {
            return res
                .status(400)
                .json({ success: false, message: "Code is required" });
        }
        const result = yield bankPremiumService_1.default.verifyBankPremiumCodeService(code);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("Error verifying BankPremium code:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "An error occurred while verifying code",
        });
    }
});
exports.verifyBankPremiumCode = verifyBankPremiumCode;
const getAllRedemptionsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const redemptions = yield (0, bankPremiumService_1.getAllRedemptionsService)();
        res.status(200).json({ success: true, data: redemptions });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.getAllRedemptionsController = getAllRedemptionsController;
exports.default = {
    createBankPremium: exports.createBankPremium,
    updateBankPremium: exports.updateBankPremium,
    deleteBankPremium: exports.deleteBankPremium,
    getAllBankPremiums: exports.getAllBankPremiums,
    getBankPremiumById: exports.getBankPremiumById,
    redeemBankPremium: exports.redeemBankPremium,
    verifyBankPremiumCode: exports.verifyBankPremiumCode,
    getAllRedemptionsService: bankPremiumService_1.getAllRedemptionsService,
};
