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
exports.deleteQRCode = exports.updateQRCode = exports.getQRCodeById = exports.getAllQRCodes = exports.createQRCode = void 0;
const QRCode_model_1 = __importDefault(require("../models/QRCode.model"));
const createQRCode = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code, points, isUsed, createdBy } = data;
        if (!code || typeof points !== 'number' || typeof isUsed !== 'boolean') {
            throw new Error('Invalid input. Ensure "code" is a string, "points" is a number, and "isUsed" is a boolean.');
        }
        const qrCode = new QRCode_model_1.default({ code, points, isUsed, createdBy });
        yield qrCode.save();
        return qrCode;
    }
    catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Error creating QR code');
    }
});
exports.createQRCode = createQRCode;
const getAllQRCodes = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield QRCode_model_1.default.find();
    }
    catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Error fetching QR codes');
    }
});
exports.getAllQRCodes = getAllQRCodes;
const getQRCodeById = (qrCodeId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield QRCode_model_1.default.findById(qrCodeId);
    }
    catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Error fetching QR code');
    }
});
exports.getQRCodeById = getQRCodeById;
const updateQRCode = (qrCodeId, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield QRCode_model_1.default.findByIdAndUpdate(qrCodeId, data, { new: true });
    }
    catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Error updating QR code');
    }
});
exports.updateQRCode = updateQRCode;
const deleteQRCode = (qrCodeId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield QRCode_model_1.default.findByIdAndDelete(qrCodeId);
    }
    catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Error deleting QR code');
    }
});
exports.deleteQRCode = deleteQRCode;
