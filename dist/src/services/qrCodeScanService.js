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
exports.handleQRCodeScan = void 0;
const QRCode_model_1 = __importDefault(require("../models/QRCode.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const userHistory_model_1 = __importDefault(require("../models/userHistory.model"));
const mongoose_1 = __importDefault(require("mongoose"));
function isBrandPopulated(brand) {
    return brand && typeof brand === 'object' && 'brandName' in brand;
}
const handleQRCodeScan = (userId, scannedCode) => __awaiter(void 0, void 0, void 0, function* () {
    const qrCodeDoc = yield QRCode_model_1.default.findOne({ code: scannedCode }).populate('brand');
    const qrCode = qrCodeDoc;
    if (!qrCode) {
        throw new Error('QR Code not found');
    }
    // Check if the QR code is marked as used system-wide
    if (qrCode.isUsed) {
        throw new Error('QR Code has already been used');
    }
    const user = yield user_model_1.default.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    // Prevent user from scanning same QR multiple times
    if (user.scanned_qr_codes.includes(qrCode._id.toString())) {
        throw new Error('QR Code already scanned by this user');
    }
    const pointsEarned = qrCode.points;
    // Add scanned QR code to user history
    user.scanned_qr_codes.push(qrCode._id.toString());
    const brandId = (qrCode.brand instanceof mongoose_1.default.Types.ObjectId)
        ? qrCode.brand
        : (qrCode.brand && '_id' in qrCode.brand ? qrCode.brand._id : null);
    if (!brandId) {
        throw new Error('QR Code is not associated with a valid brand');
    }
    // Add or update points in user.brandPoints
    const existingBrandEntry = user.brandPoints.find((entry) => entry.brand.toString() === brandId.toString());
    if (existingBrandEntry) {
        existingBrandEntry.points += pointsEarned;
    }
    else {
        user.brandPoints.push({ brand: brandId, points: pointsEarned });
    }
    yield user.save();
    // Log to user history
    const userHistory = new userHistory_model_1.default({
        user_id: userId,
        points_earned: pointsEarned,
        qrCode: scannedCode,
        brand: brandId,
        points_used: 0,
        reference_id: '',
        type: 'QRCodeScan',
    });
    yield userHistory.save();
    // Mark QR as used globally
    qrCode.isUsed = true;
    yield qrCode.save();
    // Prepare populated brand details
    const populatedBrand = isBrandPopulated(qrCode.brand)
        ? {
            _id: qrCode.brand._id,
            brandName: qrCode.brand.brandName,
            description: qrCode.brand.description,
            logo: qrCode.brand.logo,
        }
        : null;
    return {
        updatedUser: {
            _id: user._id,
            name: user.name,
            brandPoints: user.brandPoints,
        },
        userHistory,
        scannedQRCode: {
            code: qrCode.code,
            brand: populatedBrand,
            points: qrCode.points,
        },
    };
});
exports.handleQRCodeScan = handleQRCodeScan;
