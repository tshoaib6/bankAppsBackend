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
exports.updateFcmToken = exports.getUsersByAddressController = exports.verifyEmail = exports.deleteUser = exports.updateUserStatus = exports.getUsers = exports.login = exports.register = void 0;
const userService_1 = require("../services/userService");
const validators_1 = require("../utils/validators");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user.model"));
// 🚀 Register User (no brand attached at registration)
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, date_of_birth, is_over_18, address, parish, userRole // ✅ new optional field
         } = req.body;
        if (!(0, validators_1.validateName)(name))
            return res.status(400).json({ message: "Invalid name" });
        if (!(0, validators_1.validateEmail)(email))
            return res.status(400).json({ message: "Invalid email" });
        if (!(0, validators_1.validatePassword)(password))
            return res.status(400).json({
                message: "Password must be at least 6 characters",
            });
        if (!parish || typeof parish !== "string")
            return res.status(400).json({ message: "Parish is required" });
        // ✅ Pass role to service (default will be user if not sent)
        const newUser = yield (0, userService_1.registerUser)(name, email, password, date_of_birth, is_over_18, address, parish, userRole || "user" // ✅ force default user
        );
        res.status(201).json({
            message: "User registered successfully. Please check your email to verify your account.",
            user: newUser,
        });
    }
    catch (error) {
        console.error("Error in user registration:", error);
        res.status(500).json({ message: "Server error, please try again" });
    }
});
exports.register = register;
// 🔐 Login User
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!(0, validators_1.validateEmail)(email))
            return res.status(400).json({ message: "Invalid email" });
        if (!(0, validators_1.validatePassword)(password))
            return res.status(400).json({
                message: "Password must be at least 6 characters",
            });
        const user = yield (0, userService_1.loginUserService)(email, password);
        if (!user)
            return res.status(401).json({ message: "Invalid credentials" });
        if (!user.isVerified) {
            return res
                .status(401)
                .json({ message: "Please verify your email to log in." });
        }
        // Extract brand IDs from brandPoints array
        const brandIds = user.brandPoints.map((bp) => bp.brand);
        const token = jsonwebtoken_1.default.sign({
            userId: user._id,
            email: user.email,
            username: user.name,
            userRole: user.userRole, // <--- added here
            brands: brandIds, // ✅ now using brandPoints for brand list
        }, process.env.JWT_SECRET || "secret", { expiresIn: "1h" });
        const totalPoints = user.brandPoints.reduce((sum, bp) => sum + bp.points, 0);
        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                name: user.name,
                email: user.email,
                points: user.brandPoints,
                brands: brandIds,
                address: user.address,
                userRole: user.userRole,
                _id: user._id,
            },
        });
    }
    catch (error) {
        console.error("Error in user login:", error);
        res.status(500).json({ message: "Server error, please try again" });
    }
});
exports.login = login;
// 👥 Get All Users (optionally by brand)
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { brandId } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const { users, totalCount, totalPages, currentPage } = yield (0, userService_1.getAllUsers)(page, limit, brandId);
        if (!users || users.length === 0) {
            return res.status(404).json({ message: "No users found" });
        }
        // Optional: filter brandPoints for the specific brand if brandId is provided
        const usersWithFilteredBrands = brandId
            ? users.map((user) => (Object.assign(Object.assign({}, user.toObject()), { brandPoints: user.brandPoints.filter((bp) => bp.brand.toString() === brandId) })))
            : users;
        return res.status(200).json({
            users: usersWithFilteredBrands,
            totalCount,
            totalPages,
            currentPage,
            message: "Users fetched successfully",
        });
    }
    catch (error) {
        console.error("Error fetching users:", error);
        return res
            .status(500)
            .json({ message: "Server error, please try again" });
    }
});
exports.getUsers = getUsers;
// 🔄 Update Active/Blocked Status
const updateUserStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const { isActive } = req.body;
        if (typeof isActive !== "boolean")
            return res.status(400).json({
                message: "Invalid status value. It must be a boolean.",
            });
        const updatedUser = yield (0, userService_1.updateUserStatusService)(userId, isActive);
        if (!updatedUser)
            return res.status(404).json({ message: "User not found" });
        res.status(200).json({
            message: isActive
                ? "User has been unblocked successfully"
                : "User has been blocked successfully",
            user: updatedUser,
        });
    }
    catch (error) {
        console.error("Error updating user status:", error);
        res.status(500).json({
            message: "Failed to update user status. Please try again later.",
        });
    }
});
exports.updateUserStatus = updateUserStatus;
// 🗑️ Delete User
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const deletedUser = yield (0, userService_1.deleteUserService)(userId);
        if (!deletedUser)
            return res.status(404).json({ message: "User not found" });
        res
            .status(200)
            .json({ message: "User deleted successfully", user: deletedUser });
    }
    catch (error) {
        console.error("Error deleting user:", error);
        res
            .status(500)
            .json({ message: "Failed to delete user. Please try again later." });
    }
});
exports.deleteUser = deleteUser;
// ✅ Verify Email
const verifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        const verifiedUser = yield (0, userService_1.verifyEmailService)(token);
        if (!verifiedUser)
            return res
                .status(400)
                .json({ message: "Invalid or expired verification token." });
        res.status(200).json({
            message: "Email verified successfully!",
            user: verifiedUser,
        });
    }
    catch (error) {
        console.error("Error verifying email:", error);
        res
            .status(500)
            .json({ message: "Failed to verify email. Please try again later." });
    }
});
exports.verifyEmail = verifyEmail;
// export const sendNotificationByAddress = async (req: Request, res: Response):Promise<any> => {
//   try {
//     const { address, title, message } = req.body;
//     if (!address || !title || !message) {
//       return res.status(400).json({ error: 'Address, title, and message are required.' });
//     }
//     const result = await notifyUsersByAddress(address, title, message);
//     res.status(200).json({
//       message: 'Notification sent',
//       successCount: result.successCount,
//       failureCount: result.failureCount,
//     });
//   } catch (error) {
//     console.error('Error in sendNotificationByAddress controller:', error);
//     res.status(500).json({ error: 'Failed to send notification' });
//   }
// };
const getUsersByAddressController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { address } = req.query;
        if (!address) {
            return res.status(400).json({ error: "Address is required." });
        }
        const users = yield (0, userService_1.getUsersByAddress)(address);
        res.status(200).json({
            message: "Users retrieved successfully",
            count: users.length,
            users,
        });
    }
    catch (error) {
        console.error("Error in getUsersByAddressController:", error);
        res.status(500).json({ error: "Failed to retrieve users by address" });
    }
});
exports.getUsersByAddressController = getUsersByAddressController;
const updateFcmToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params; // Get from URL params
    const { fcmToken, address } = req.body; // Get from body
    try {
        yield user_model_1.default.findByIdAndUpdate(userId, { fcmToken, address });
        res.status(200).json({ message: "FCM token updated" });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to update FCM token" });
    }
});
exports.updateFcmToken = updateFcmToken;
