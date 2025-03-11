"use strict";
// import { Request, Response } from 'express'
// import {
//   registerUser,
//   loginUserService,
//   getAllUsers,
//   updateUserStatusService,
//   deleteUserService,
//   verifyEmailService
// } from '../services/userService'
// import {
//   validateEmail,
//   validateName,
//   validatePassword
// } from '../utils/validators'
// import jwt from 'jsonwebtoken'
// import User from '../models/user.model'
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
exports.verifyEmail = exports.deleteUser = exports.updateUserStatus = exports.getUsers = exports.login = exports.register = void 0;
const userService_1 = require("../services/userService");
const validators_1 = require("../utils/validators");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, date_of_birth, is_over_18 } = req.body;
        // Input validation
        if (!(0, validators_1.validateName)(name))
            return res.status(400).json({ message: "Invalid name" });
        if (!(0, validators_1.validateEmail)(email))
            return res.status(400).json({ message: "Invalid email" });
        if (!(0, validators_1.validatePassword)(password))
            return res
                .status(400)
                .json({ message: "Password must be at least 6 characters" });
        const newUser = yield (0, userService_1.registerUser)(name, email, password, date_of_birth, is_over_18);
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
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!(0, validators_1.validateEmail)(email))
            return res.status(400).json({ message: "Invalid email" });
        if (!(0, validators_1.validatePassword)(password))
            return res
                .status(400)
                .json({ message: "Password must be at least 6 characters" });
        const user = yield (0, userService_1.loginUserService)(email, password);
        if (!user)
            return res.status(401).json({ message: "Invalid credentials" });
        if (!user.isVerified) {
            return res
                .status(401)
                .json({ message: "Please verify your email to log in." });
        }
        const token = jsonwebtoken_1.default.sign({
            userId: user._id,
            email: user.email,
            username: user.name,
        }, process.env.JWT_SECRET || "secret", { expiresIn: "1h" });
        res.status(200).json({
            message: "Login successful",
            token,
            user: { name: user.name, email: user.email, points: user.points },
        });
    }
    catch (error) {
        console.error("Error in user login:", error);
        res.status(500).json({ message: "Server error, please try again" });
    }
});
exports.login = login;
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield (0, userService_1.getAllUsers)();
        if (!users || users.length === 0)
            return res.status(404).json({ message: "No users found" });
        res.status(200).json({ users });
    }
    catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Server error, please try again" });
    }
});
exports.getUsers = getUsers;
const updateUserStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const { isActive } = req.body;
        if (typeof isActive !== "boolean")
            return res
                .status(400)
                .json({ message: "Invalid status value. It must be a boolean." });
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
const verifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        const verifiedUser = yield (0, userService_1.verifyEmailService)(token);
        if (!verifiedUser)
            return res
                .status(400)
                .json({ message: "Invalid or expired verification token." });
        res
            .status(200)
            .json({ message: "Email verified successfully!", user: verifiedUser });
    }
    catch (error) {
        console.error("Error verifying email:", error);
        res
            .status(500)
            .json({ message: "Failed to verify email. Please try again later." });
    }
});
exports.verifyEmail = verifyEmail;
