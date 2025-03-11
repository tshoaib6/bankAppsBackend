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
exports.getAllBankPremiums = void 0;
const bankPremium_model_1 = __importDefault(require("../models/bankPremium.model"));
const createBankPremium = (userId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const newBankPremium = new bankPremium_model_1.default(Object.assign(Object.assign({}, data), { enrolled_users: [] }));
    return yield newBankPremium.save();
});
const getBankPremiumById = (bankPremiumId) => __awaiter(void 0, void 0, void 0, function* () {
    const bankPremium = yield bankPremium_model_1.default.findById(bankPremiumId);
    if (!bankPremium)
        throw new Error('BankPremium not found');
    return bankPremium;
});
const updateBankPremium = (bankPremiumId, updates) => __awaiter(void 0, void 0, void 0, function* () {
    const existingBankPremium = yield bankPremium_model_1.default.findById(bankPremiumId);
    if (!existingBankPremium)
        throw new Error('BankPremium not found');
    Object.keys(updates).forEach((key) => {
        if (key !== 'enrolled_users' && updates[key] !== undefined) {
            existingBankPremium.set(key, updates[key]);
        }
    });
    return yield existingBankPremium.save();
});
const deleteBankPremium = (bankPremiumId) => __awaiter(void 0, void 0, void 0, function* () {
    const bankPremium = yield bankPremium_model_1.default.findByIdAndDelete(bankPremiumId);
    if (!bankPremium)
        throw new Error('BankPremium not found');
    return bankPremium;
});
const getAllBankPremiums = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield bankPremium_model_1.default.find();
    }
    catch (error) {
        console.error('Error fetching BankPremiums from the database:', error);
        throw new Error('Error fetching BankPremiums');
    }
});
exports.getAllBankPremiums = getAllBankPremiums;
exports.default = {
    createBankPremium,
    updateBankPremium,
    deleteBankPremium,
    getBankPremiumById,
    getAllBankPremiums: exports.getAllBankPremiums,
};
