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
exports.uploadToCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
const streamifier_1 = __importDefault(require("streamifier"));
const fs_1 = __importDefault(require("fs"));
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const uploadToCloudinary = (fileInput, folder) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fileBuffer = typeof fileInput === 'string' ? fs_1.default.readFileSync(fileInput) : fileInput;
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.v2.uploader.upload_stream({ folder }, (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    reject(error);
                }
                else {
                    if (result) {
                        console.log('Cloudinary upload result:', result);
                        resolve(result.secure_url || '');
                    }
                    else {
                        reject(new Error('No result returned from Cloudinary'));
                    }
                }
            });
            streamifier_1.default.createReadStream(fileBuffer).pipe(uploadStream);
        });
    }
    catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
        throw new Error('Error uploading image to Cloudinary');
    }
});
exports.uploadToCloudinary = uploadToCloudinary;
