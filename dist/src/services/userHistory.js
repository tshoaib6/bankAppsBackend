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
exports.logUserActivity = void 0;
const userHistory_model_1 = __importDefault(require("../models/userHistory.model"));
const logUserActivity = (userId_1, description_1, type_1, ...args_1) => __awaiter(void 0, [userId_1, description_1, type_1, ...args_1], void 0, function* (userId, description, type, pointsEarned = 0, pointsUsed = 0, referenceId = '') {
    try {
        const historyEntry = new userHistory_model_1.default({
            user_id: userId,
            description,
            type,
            points_earned: pointsEarned,
            points_used: pointsUsed,
            reference_id: referenceId,
        });
        yield historyEntry.save();
    }
    catch (error) {
        console.error('Error logging user activity:', error);
    }
});
exports.logUserActivity = logUserActivity;
