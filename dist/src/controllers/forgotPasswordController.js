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
exports.setNewPassword = exports.resendOTP = exports.verifyOTP = exports.requestPasswordReset = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const forgotPasswordService_1 = require("../services/forgotPasswordService");
const generateToken = (email, userId) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined.');
    }
    return jsonwebtoken_1.default.sign({ email, userId }, process.env.JWT_SECRET, {
        expiresIn: '15m'
    });
};
const requestPasswordReset = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
    }
    try {
        yield forgotPasswordService_1.forgotPasswordService.requestReset(email);
        return res.status(200).json({ message: 'OTP sent to email.' });
    }
    catch (error) {
        return res.status(400).json({ message: error.message });
    }
});
exports.requestPasswordReset = requestPasswordReset;
const verifyOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp } = req.body;
    try {
        const isValid = yield forgotPasswordService_1.forgotPasswordService.verifyOTP(email, otp);
        if (isValid) {
            const newToken = generateToken(email, email);
            res.status(200).json({
                message: 'OTP verified successfully. You may proceed to reset your password.',
                token: newToken
            });
        }
        else {
            res.status(400).json({ message: 'Invalid or expired OTP.' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.verifyOTP = verifyOTP;
const resendOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
    }
    try {
        yield forgotPasswordService_1.forgotPasswordService.resendOTP(email);
        res.status(200).json({ message: 'New OTP sent to your email.' });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.resendOTP = resendOTP;
const setNewPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { newPassword, confirmPassword } = req.body;
    const authorizationHeader = req.headers['authorization'];
    const token = authorizationHeader === null || authorizationHeader === void 0 ? void 0 : authorizationHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token provided.' });
    }
    if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match.' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const userIdFromToken = decoded.email || decoded.userId;
        if (!userIdFromToken) {
            return res
                .status(400)
                .json({ message: 'Invalid token or user mismatch.' });
        }
        yield forgotPasswordService_1.forgotPasswordService.setNewPassword(userIdFromToken, newPassword);
        res.status(200).json({ message: 'Password updated successfully.' });
    }
    catch (error) {
        if (error.name === 'JsonWebTokenError' ||
            error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Invalid or expired token.' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.setNewPassword = setNewPassword;
