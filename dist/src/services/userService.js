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
exports.getUsersByAddress = exports.verifyEmailService = exports.deleteUserService = exports.updateUserStatusService = exports.getAllUsers = exports.loginUserService = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_model_1 = __importDefault(require("../models/user.model"));
const emailService_1 = require("../utils/emailService");
const pagination_1 = require("../utils/pagination");
/**
 * Register a new user
 * Brand assignment is handled separately after login
 */
const registerUser = (name_1, email_1, password_1, date_of_birth_1, is_over_18_1, address_1, parish_1, ...args_1) => __awaiter(void 0, [name_1, email_1, password_1, date_of_birth_1, is_over_18_1, address_1, parish_1, ...args_1], void 0, function* (name, email, password, date_of_birth, is_over_18, address, parish, userRole = 'user' // ✅ optional, defaults to 'user'
) {
    try {
        const existingUser = yield user_model_1.default.findOne({ email });
        if (existingUser)
            throw new Error('Email already exists');
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationTokenExpiry = new Date(Date.now() + 1000 * 60 * 10);
        const newUser = new user_model_1.default({
            name,
            email,
            date_of_birth,
            is_over_18,
            address,
            parish,
            password: hashedPassword,
            verificationToken,
            verificationTokenExpiry,
            userRole, // ✅ explicitly set role
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
/**
 * Login user
 */
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
/**
 * Get all users
 * Optional brandId filter supports brandPoints
 */
const getAllUsers = (page, limit, brandId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filter = brandId ? { "brandPoints.brand": brandId } : {};
        const { data: users, totalCount, totalPages, currentPage } = yield (0, pagination_1.paginate)(user_model_1.default, {
            page,
            limit,
            filter,
            sort: { createdAt: -1 }, // newest users first
        });
        return {
            users,
            totalCount,
            totalPages,
            currentPage,
        };
    }
    catch (error) {
        console.error("Error in getAllUsers service:", error);
        throw new Error("Error fetching users");
    }
});
exports.getAllUsers = getAllUsers;
/**
 * Update user active status
 */
const updateUserStatusService = (userId, isActive) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield user_model_1.default.findByIdAndUpdate(userId, { isActive }, { new: true });
    }
    catch (error) {
        console.error('Error in updateUserStatusService:', error);
        throw new Error('Error updating user status');
    }
});
exports.updateUserStatusService = updateUserStatusService;
/**
 * Delete user
 */
const deleteUserService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield user_model_1.default.findByIdAndDelete(userId);
    }
    catch (error) {
        console.error('Error in deleteUserService:', error);
        throw new Error('Error deleting user');
    }
});
exports.deleteUserService = deleteUserService;
/**
 * Email verification
 */
const verifyEmailService = (code) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.default.findOne({ verificationToken: code });
        if (!user)
            throw new Error('Invalid verification code');
        if (user.verificationTokenExpiry &&
            user.verificationTokenExpiry < new Date()) {
            throw new Error('Verification code has expired');
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
const getUsersByAddress = (address) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield user_model_1.default.find({ address, fcmToken: { $ne: null } });
        const validUsers = users.filter(user => typeof user.fcmToken === 'string' &&
            user.fcmToken.trim().length > 0);
        return validUsers;
    }
    catch (error) {
        console.error('Error in getUsersByAddress service:', error);
        throw new Error('Error retrieving users by address');
    }
});
exports.getUsersByAddress = getUsersByAddress;
