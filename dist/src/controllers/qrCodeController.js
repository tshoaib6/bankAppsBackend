"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.bulkUploadQRCodes = exports.getQRCodesByBrandId = exports.deleteQRCode = exports.updateQRCode = exports.getQRCodeById = exports.getAllQRCodes = exports.createQRCode = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const QRCodeService = __importStar(require("../services/qrCodeService"));
const fs_1 = __importDefault(require("fs"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const createQRCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", "");
        if (!token) {
            return res.status(401).json({ message: "Authorization token required" });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        const { code, points, isUsed, brand } = req.body;
        if (!code ||
            typeof points !== "number" ||
            typeof isUsed !== "boolean" ||
            !brand) {
            return res.status(400).json({
                message: 'Invalid input. Ensure "code" is a string, "points" is a number, "isUsed" is a boolean, and "brand" is provided.',
            });
        }
        const qrCodeData = { code, points, isUsed, createdBy: userId, brand };
        const qrCode = yield QRCodeService.createQRCode(qrCodeData);
        return res
            .status(201)
            .json({ message: "QR Code created successfully", qrCode });
    }
    catch (error) {
        return res.status(500).json({
            message: "Server error while creating QR code. Please try again later.",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.createQRCode = createQRCode;
const getAllQRCodes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const { qrCodes, totalCount, usedCount, unusedCount, totalPages, currentPage, } = yield QRCodeService.getAllQRCodes(page, limit);
        return res.status(200).json({
            qrCodes,
            totalCount,
            usedCount,
            unusedCount,
            totalPages,
            currentPage,
            message: "QR Codes fetched successfully",
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Server error while fetching QR codes. Please try again later.",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.getAllQRCodes = getAllQRCodes;
const getQRCodeById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { qrCodeId } = req.params;
        const qrCode = yield QRCodeService.getQRCodeById(qrCodeId);
        if (!qrCode) {
            return res.status(404).json({ message: "QR Code not found" });
        }
        return res
            .status(200)
            .json({ qrCode, message: "QR Code fetched successfully" });
    }
    catch (error) {
        return res.status(500).json({
            message: "Server error while fetching QR code. Please try again later.",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.getQRCodeById = getQRCodeById;
const updateQRCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", "");
        if (!token) {
            return res.status(401).json({ message: "Authorization token required" });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // ✅ Only allow if role is "admin"
        if (decoded.userRole !== "admin") {
            return res.status(403).json({
                message: "Only admins are authorized to update QR Codes.",
            });
        }
        const { qrCodeId } = req.params;
        const { code, points, isUsed, brand } = req.body;
        if (!code ||
            typeof points !== "number" ||
            typeof isUsed !== "boolean" ||
            !brand) {
            return res.status(400).json({
                message: 'Invalid input. Ensure "code" is a string, "points" is a number, "isUsed" is a boolean, and "brand" is provided.',
            });
        }
        const qrCode = yield QRCodeService.getQRCodeById(qrCodeId);
        if (!qrCode) {
            return res.status(404).json({ message: "QR Code not found" });
        }
        // ✅ No need to check createdBy anymore, only role matters
        const updatedQRCode = yield QRCodeService.updateQRCode(qrCodeId, {
            code,
            points,
            isUsed,
            brand,
        });
        return res.status(200).json({
            message: "QR Code updated successfully",
            updatedQRCode,
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Server error while updating QR code. Please try again later.",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.updateQRCode = updateQRCode;
const deleteQRCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", "");
        if (!token) {
            return res.status(401).json({ message: "Authorization token required" });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        const { qrCodeId } = req.params;
        const qrCode = yield QRCodeService.getQRCodeById(qrCodeId);
        if (!qrCode) {
            return res.status(404).json({ message: "QR Code not found" });
        }
        // if (qrCode.createdBy.toString() !== userId) {
        //   return res.status(403).json({
        //     message: 'You are not authorized to delete this QR Code.'
        //   });
        // }
        yield QRCodeService.deleteQRCode(qrCodeId);
        return res.status(200).json({ message: "QR Code deleted successfully" });
    }
    catch (error) {
        return res.status(500).json({
            message: "Server error while deleting QR code. Please try again later.",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.deleteQRCode = deleteQRCode;
const getQRCodesByBrandId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { brandId } = req.params;
        if (!brandId) {
            return res.status(400).json({ message: "Brand ID is required" });
        }
        const qrCodes = yield QRCodeService.getQRCodesByBrandId(brandId);
        if (!qrCodes || qrCodes.length === 0) {
            return res
                .status(404)
                .json({ message: "No QR Codes found for this brand" });
        }
        return res.status(200).json({
            qrCodes,
            message: "QR Codes fetched successfully for the brand",
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Server error while fetching QR codes by brand",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.getQRCodesByBrandId = getQRCodesByBrandId;
const bulkUploadQRCodes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!req.file) {
            return res.status(400).json({ message: "CSV file is required" });
        }
        const token = (_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", "");
        if (!token) {
            return res.status(401).json({ message: "Authorization token required" });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        const qrCodeData = [];
        fs_1.default.createReadStream(req.file.path)
            .pipe((0, csv_parser_1.default)({ trim: true })) // TypeScript-safe cast
            .on("data", (row) => {
            // Only push rows with required fields
            if (row.code && row.brand) {
                qrCodeData.push({
                    code: row.code.trim(),
                    points: Number(row.points) || 0,
                    isUsed: row.isUsed === "true" || row.isUsed === true,
                    createdBy: userId,
                    brand: row.brand.trim(),
                });
            }
        })
            .on("end", () => __awaiter(void 0, void 0, void 0, function* () {
            console.log("QR Code data read from CSV:", qrCodeData); // debug log
            if (qrCodeData.length === 0) {
                return res
                    .status(400)
                    .json({ message: "No valid QR codes found in CSV" });
            }
            const result = yield QRCodeService.bulkInsertQRCodes(qrCodeData);
            return res.status(201).json({
                message: `${result.insertedCount} QR codes inserted successfully`,
                errors: result.errors.length,
            });
        }))
            .on("error", (err) => {
            console.error("Error reading CSV:", err);
            return res
                .status(500)
                .json({ message: "Error reading CSV file", error: err });
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Server error while uploading QR codes. Please try again later.",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
exports.bulkUploadQRCodes = bulkUploadQRCodes;
