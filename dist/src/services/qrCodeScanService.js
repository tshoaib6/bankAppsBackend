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
const handleQRCodeScan = (userId, scannedCode) => __awaiter(void 0, void 0, void 0, function* () {
    const qrCode = yield QRCode_model_1.default.findOne({ code: scannedCode });
    if (!qrCode) {
        throw new Error('QR Code not found');
    }
    if (qrCode.isUsed) {
        throw new Error('QR Code has already been used');
    }
    const user = yield user_model_1.default.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    const pointsEarned = qrCode.points;
    user.points += pointsEarned;
    yield user.save();
    const userHistory = new userHistory_model_1.default({
        user_id: userId,
        points_earned: pointsEarned,
        qrCode: scannedCode,
        points_used: 0,
        reference_id: '',
        type: 'QRCodeScan'
    });
    yield userHistory.save();
    qrCode.isUsed = true;
    yield qrCode.save();
    return {
        updatedUser: user,
        userHistory: userHistory
    };
});
exports.handleQRCodeScan = handleQRCodeScan;
