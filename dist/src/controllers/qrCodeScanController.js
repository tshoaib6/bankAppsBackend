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
exports.scanQRCode = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const qrCodeScanService_1 = require("../services/qrCodeScanService");
const scanQRCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        if (!token)
            return res.status(401).json({ message: 'Authorization token required' });
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        const { scannedCode } = req.body;
        if (!scannedCode) {
            return res.status(400).json({ message: 'Scanned code is required' });
        }
        const result = yield (0, qrCodeScanService_1.handleQRCodeScan)(userId, scannedCode);
        const updatedUser = result.updatedUser;
        const userHistory = result.userHistory;
        return res.status(200).json({
            message: 'QR Code scanned successfully. Points added to your account.',
            userId: updatedUser._id,
            userPoints: updatedUser.points,
            userHistory: userHistory,
            userName: updatedUser.name,
        });
    }
    catch (error) {
        console.error('Error in QR code scan:', error.message);
        return res.status(500).json({
            message: 'Server error while scanning QR code. Please try again later.',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
exports.scanQRCode = scanQRCode;
