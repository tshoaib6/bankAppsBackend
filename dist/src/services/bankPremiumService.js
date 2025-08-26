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
exports.getAllRedemptionsService = exports.verifyBankPremiumCodeService = exports.redeemBankPremiumService = exports.getAllBankPremiums = void 0;
const bankPremium_model_1 = __importDefault(require("../models/bankPremium.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const userHistory_model_1 = __importDefault(require("../models/userHistory.model"));
const uuid_1 = require("uuid");
const createBankPremium = (userId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const newBankPremium = new bankPremium_model_1.default(Object.assign(Object.assign({}, data), { enrolled_users: [], brand: data.brand || null, redemptions: [] }));
    return yield newBankPremium.save();
});
const getBankPremiumById = (bankPremiumId) => __awaiter(void 0, void 0, void 0, function* () {
    const bankPremium = yield bankPremium_model_1.default.findById(bankPremiumId).populate('enrolled_users');
    if (!bankPremium)
        throw new Error('BankPremium not found');
    return bankPremium;
});
const updateBankPremium = (bankPremiumId, updates) => __awaiter(void 0, void 0, void 0, function* () {
    const existingBankPremium = yield bankPremium_model_1.default.findById(bankPremiumId);
    if (!existingBankPremium)
        throw new Error('BankPremium not found');
    Object.keys(updates).forEach((key) => {
        if (key !== 'enrolled_users' &&
            key !== 'redemptions' && // prevent overwriting redemptions manually
            updates[key] !== undefined) {
            existingBankPremium.set(key, updates[key]);
        }
    });
    return yield existingBankPremium.save();
});
const deleteBankPremium = (bankPremiumId) => __awaiter(void 0, void 0, void 0, function* () {
    const bankPremium = yield bankPremium_model_1.default.findByIdAndDelete(bankPremiumId);
    if (!bankPremium)
        throw new Error('BankPremium not found');
    return bankPremium;
});
const getAllBankPremiums = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield bankPremium_model_1.default.find().populate('enrolled_users');
    }
    catch (error) {
        console.error('Error fetching BankPremiums from the database:', error);
        throw new Error('Error fetching BankPremiums');
    }
});
exports.getAllBankPremiums = getAllBankPremiums;
/**
 * Redeem a BankPremium for a user.
 * @param userId - ID of the user redeeming the premium.
 * @param premiumId - ID of the premium to redeem.
 * @returns user info + premium info + unique code
 */
const redeemBankPremiumService = (userId, premiumId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bankPremium = yield bankPremium_model_1.default.findById(premiumId)
            .populate('brand')
            .exec();
        if (!bankPremium) {
            throw new Error('BankPremium not found');
        }
        const pointsRequired = parseInt(bankPremium.points_required, 10);
        if (isNaN(pointsRequired)) {
            throw new Error('Invalid points requirement for this premium');
        }
        const user = yield user_model_1.default.findById(userId).exec();
        if (!user) {
            throw new Error('User not found');
        }
        if (!bankPremium.brand) {
            throw new Error('BankPremium brand not properly set');
        }
        const brandId = bankPremium.brand.toString();
        // Find user's points for that brand
        const brandPointsEntry = user.brandPoints.find(entry => entry.brand.toString() === brandId);
        if (!brandPointsEntry || brandPointsEntry.points < pointsRequired) {
            throw new Error('Insufficient points in this brand to redeem the premium');
        }
        // Deduct brand points
        brandPointsEntry.points -= pointsRequired;
        yield user.save();
        // Ensure enrolled_users contains this user
        if (!bankPremium.enrolled_users.map(id => id.toString()).includes(user._id.toString())) {
            bankPremium.enrolled_users.push(user._id); // ✅ push ObjectId, not string
        }
        // Generate unique redemption code
        const code = (0, uuid_1.v4)().split('-')[0].toUpperCase(); // Example: "A1B2C3D4"
        // Add redemption entry
        bankPremium.redemptions.push({
            user: user._id,
            code,
            status: 'pending',
            redeemedAt: new Date()
        });
        yield bankPremium.save();
        // Log user history
        const userHistoryEntry = new userHistory_model_1.default({
            user_id: user._id,
            date: new Date(),
            description: `Redeemed bank premium: ${bankPremium.title}`,
            points_used: pointsRequired.toString(),
            type: 'bank_premium_purchase',
            reference_id: premiumId,
            brand: brandId,
            points_earned: 0, // no points earned, only redeemed
            qrCode: code // store unique code here as well if you want
        });
        yield userHistoryEntry.save();
        return {
            user: {
                userId: user._id,
                username: user.name,
                remaining_brand_points: brandPointsEntry.points,
                brandId: brandId,
            },
            bankPremium: {
                title: bankPremium.title,
                points_required: bankPremium.points_required,
                enrolled_users: bankPremium.enrolled_users,
                redemptions: bankPremium.redemptions,
                brand: bankPremium.brand
            },
            receipt: {
                code, // ✅ this code goes on the frontend receipt
                status: 'pending'
            },
            userHistory: {
                description: userHistoryEntry.description,
                points_used: userHistoryEntry.points_used,
                type: userHistoryEntry.type,
            }
        };
    }
    catch (error) {
        console.error('Error redeeming bank premium service:', error);
        throw new Error(error.message || 'An error occurred during bank premium redemption');
    }
});
exports.redeemBankPremiumService = redeemBankPremiumService;
/**
 * Verify redemption code (Admin use).
 */
const verifyBankPremiumCodeService = (code) => __awaiter(void 0, void 0, void 0, function* () {
    const bankPremium = yield bankPremium_model_1.default.findOne({ "redemptions.code": code });
    if (!bankPremium)
        throw new Error("Invalid code");
    const redemption = bankPremium.redemptions.find(r => r.code === code);
    if (!redemption)
        throw new Error("Invalid redemption code");
    if (redemption.status === "delivered") {
        throw new Error("Code already delivered");
    }
    redemption.status = "delivered";
    redemption.redeemedAt = new Date(); // ✅ optional: update timestamp if needed
    yield bankPremium.save();
    return {
        success: true,
        message: "Premium delivered successfully",
        data: {
            code: redemption.code,
            status: redemption.status,
            redeemedAt: redemption.redeemedAt,
            user: redemption.user,
        },
    };
});
exports.verifyBankPremiumCodeService = verifyBankPremiumCodeService;
const getAllRedemptionsService = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield bankPremium_model_1.default.aggregate([
        { $unwind: "$redemptions" },
        {
            $lookup: {
                from: "users", // 👈 must match your MongoDB collection name for users
                localField: "redemptions.user",
                foreignField: "_id",
                as: "userInfo"
            }
        },
        { $unwind: "$userInfo" }, // ensure userInfo is an object, not array
        {
            $project: {
                _id: 0,
                bankPremiumId: "$_id",
                title: 1,
                code: "$redemptions.code",
                status: "$redemptions.status",
                redeemedAt: "$redemptions.redeemedAt",
                user: {
                    _id: "$userInfo._id",
                    name: "$userInfo.name",
                    email: "$userInfo.email",
                    address: "$userInfo.address",
                    parish: "$userInfo.parish"
                }
            }
        }
    ]);
    return result;
});
exports.getAllRedemptionsService = getAllRedemptionsService;
exports.default = {
    createBankPremium,
    updateBankPremium,
    deleteBankPremium,
    getBankPremiumById,
    getAllBankPremiums: exports.getAllBankPremiums,
    redeemBankPremiumService: exports.redeemBankPremiumService,
    verifyBankPremiumCodeService: exports.verifyBankPremiumCodeService,
    getAllRedemptionsService: exports.getAllRedemptionsService
};
