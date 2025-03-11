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
exports.verifyEmailService = exports.deleteUserService = exports.updateUserStatusService = exports.getAllUsers = exports.loginUserService = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const user_model_1 = __importDefault(require("../models/user.model"));
const emailService_1 = require("../utils/emailService");
const registerUser = (name, email, password, date_of_birth, is_over_18) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingUser = yield user_model_1.default.findOne({ email });
        if (existingUser)
            throw new Error('Email already exists');
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
        const verificationTokenExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24); // Token valid for 24 hours
        const newUser = new user_model_1.default({
            name,
            email,
            date_of_birth,
            is_over_18,
            password: hashedPassword,
            verificationToken,
            verificationTokenExpiry
        });
        yield newUser.save();
        yield (0, emailService_1.sendVerificationEmail)(email, verificationToken);
        return newUser;
    }
    catch (error) {
        console.error('Error in registerUser service:', error);
        throw new Error('Error registering user');
    }
});
exports.registerUser = registerUser;
const loginUserService = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.default.findOne({ email });
        if (!user)
            throw new Error('User not found');
        if (!user.isVerified)
            throw new Error('Email is not verified');
        const isPasswordMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordMatch)
            throw new Error('Invalid email or password');
        return user;
    }
    catch (error) {
        console.error('Error in loginUserService:', error);
        throw new Error('Error logging in');
    }
});
exports.loginUserService = loginUserService;
const getAllUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield user_model_1.default.find({});
        return users;
    }
    catch (error) {
        console.error('Error in getAllUsers service:', error);
        throw new Error('Error fetching users');
    }
});
exports.getAllUsers = getAllUsers;
const updateUserStatusService = (userId, isActive) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedUser = yield user_model_1.default.findByIdAndUpdate(userId, { isActive }, { new: true });
        return updatedUser;
    }
    catch (error) {
        console.error('Error in updateUserStatusService:', error);
        throw new Error('Error updating user status');
    }
});
exports.updateUserStatusService = updateUserStatusService;
const deleteUserService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deletedUser = yield user_model_1.default.findByIdAndDelete(userId);
        return deletedUser;
    }
    catch (error) {
        console.error('Error in deleteUserService:', error);
        throw new Error('Error deleting user');
    }
});
exports.deleteUserService = deleteUserService;
const verifyEmailService = (token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.default.findOne({ verificationToken: token });
        if (!user)
            throw new Error('Invalid token');
        if (user.verificationTokenExpiry &&
            user.verificationTokenExpiry < new Date()) {
            throw new Error('Token has expired');
        }
        user.isVerified = true;
        user.verificationToken = '';
        user.verificationTokenExpiry = null;
        yield user.save();
        return user;
    }
    catch (error) {
        console.error('Error in verifyEmailService:', error);
        throw new Error('Error verifying email');
    }
});
exports.verifyEmailService = verifyEmailService;
