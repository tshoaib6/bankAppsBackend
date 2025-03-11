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
exports.forgotPasswordService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const user_model_1 = __importDefault(require("../models/user.model"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const forgotPasswordEmail_1 = require("../utils/forgotPasswordEmail");
exports.forgotPasswordService = {
    requestReset: (email) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield user_model_1.default.findOne({ email });
        if (!user) {
            throw new Error('Email not found.');
        }
        const otp = crypto_1.default.randomInt(100000, 999999).toString();
        user.resetOTP = otp;
        user.otpExpires = new Date(Date.now() + 2 * 60 * 1000);
        yield user.save();
        yield (0, forgotPasswordEmail_1.sendEmail)(user.email, 'Password Reset OTP', `Your OTP for password reset is: ${otp}. It will expire in 2 minutes.`);
    }),
    verifyOTP: (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield user_model_1.default.findOne({ email, resetOTP: otp });
        if (!user) {
            console.log('No user found with this OTP.');
            return false; // Invalid OTP
        }
        console.log('OTP expires at:', user.otpExpires);
        console.log('Current time:', new Date());
        // Check if OTP has expired
        if (user.otpExpires && user.otpExpires.getTime() < new Date().getTime()) {
            console.log('OTP has expired.');
            return false; // OTP expired
        }
        // OTP is valid; clear OTP and expiration time
        user.resetOTP = undefined;
        user.otpExpires = undefined;
        yield user.save();
        console.log('OTP verified successfully.');
        return true; // OTP verified successfully
    }),
    resendOTP: (email) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield user_model_1.default.findOne({ email });
        if (!user) {
            throw new Error('Email not found.');
        }
        const otp = crypto_1.default.randomInt(100000, 999999).toString();
        user.resetOTP = otp;
        user.otpExpires = new Date(Date.now() + 2 * 60 * 1000);
        yield user.save();
        yield (0, forgotPasswordEmail_1.sendEmail)(user.email, 'Password Reset OTP', `Your new OTP for password reset is: ${otp}. It will expire in 2 minutes.`);
    }),
    setNewPassword: (email, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield user_model_1.default.findOne({ email });
        if (!user)
            throw new Error('User not found.');
        const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetOTP = undefined;
        user.otpExpires = undefined;
        const updatedUser = yield user.save();
        if (!updatedUser) {
            throw new Error('Password update failed.');
        }
        yield (0, forgotPasswordEmail_1.sendEmail)(user.email, 'Your Password Has Been Updated', 'Your password has been successfully updated.');
    })
};
