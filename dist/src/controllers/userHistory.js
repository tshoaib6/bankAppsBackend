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
exports.getUserHistory = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userHistory_model_1 = __importDefault(require("../models/userHistory.model"));
const getUserHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'Authorization token required' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        const userHistory = yield userHistory_model_1.default.find({ user_id: userId }).sort({
            date: -1
        });
        if (!userHistory || userHistory.length === 0) {
            return res
                .status(404)
                .json({ message: 'No activity found for this user' });
        }
        return res.status(200).json({ userHistory });
    }
    catch (error) {
        console.error('Error fetching user history:', error);
        return res
            .status(500)
            .json({ message: 'Server error while fetching user history' });
    }
});
exports.getUserHistory = getUserHistory;
