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
// export const scanQRCode = async (req: Request, res: Response): Promise<any> => {
//   try {
//     const token = req.header('Authorization')?.replace('Bearer ', '');
//     if (!token) {
//       return res.status(401).json({ message: 'Authorization token required' });
//     }
//     const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
//     const userId = decoded.userId;
//     const { scannedCode } = req.body;
//     if (!scannedCode) {
//       return res.status(400).json({ message: 'Scanned code is required' });
//     }
//     const {
//       updatedUser,
//       userHistory,
//       scannedQRCode,
//     } = await handleQRCodeScan(userId, scannedCode);
//     return res.status(200).json({
//       message: 'QR Code scanned successfully. Points added to your account.',
//       userId: updatedUser._id,
//       userPoints: updatedUser.brandPoints,
//       userName: updatedUser.name,
//       userHistory,
//       scannedQRCode, // includes code, points, and brand if available
//     });
//   } catch (error: any) {
//     console.error('Error in QR code scan:', error.message);
//     return res.status(500).json({
//       message: 'Server error while scanning QR code. Please try again later.',
//       error: error instanceof Error ? error.message : 'Unknown error',
//     });
//   }
// };
const scanQRCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", "");
        if (!token) {
            return res.status(401).json({ message: "Authorization token required" });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        const { scannedCode } = req.body;
        if (!scannedCode) {
            return res.status(400).json({ message: "Scanned code is required" });
        }
        const { updatedUser, userHistory, scannedQRCode } = yield (0, qrCodeScanService_1.handleQRCodeScan)(userId, scannedCode);
        return res.status(200).json({
            message: "QR Code scanned successfully. Points added to your account.",
            userId: updatedUser._id,
            userPoints: updatedUser.brandPoints,
            userName: updatedUser.name,
            userHistory,
            scannedQRCode, // includes code, points, and brand
        });
    }
    catch (error) {
        console.error("Error in QR code scan:", error.message);
        // 🔥 Distinguish between error types
        if (error.message === "QR Code not found") {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === "QR Code has already been used") {
            return res.status(409).json({ message: error.message });
        }
        if (error.message === "QR Code already scanned by this user") {
            return res.status(409).json({ message: error.message });
        }
        if (error.message === "User not found") {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === "QR Code is not associated with a valid brand") {
            return res.status(400).json({ message: error.message });
        }
        // Default fallback → internal error
        return res.status(500).json({
            message: "Server error while scanning QR code. Please try again later.",
            error: error.message,
        });
    }
});
exports.scanQRCode = scanQRCode;
