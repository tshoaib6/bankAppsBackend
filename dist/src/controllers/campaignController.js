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
exports.getCampaignById = exports.getAllCampaigns = exports.deleteCampaign = exports.updateCampaign = exports.createCampaign = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const campaignService_1 = __importDefault(require("../services/campaignService"));
const cloudinary_1 = require("../utils/cloudinary");
const createCampaign = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        if (!token)
            return res.status(401).json({ message: 'Authorization token required' });
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        const { title, description, points_required, start_date, end_date, active } = req.body;
        if (!req.file)
            return res.status(400).json({ message: 'Image is required' });
        const imageUrl = yield (0, cloudinary_1.uploadToCloudinary)(req.file.buffer, 'campaign_images');
        const campaignData = {
            title,
            description,
            points_required,
            start_date: new Date(start_date),
            end_date: new Date(end_date),
            image_url: imageUrl,
            active,
            enrolled_users: []
        };
        const newCampaign = yield campaignService_1.default.createCampaign(userId, campaignData);
        return res.status(201).json({ campaign: newCampaign });
    }
    catch (error) {
        console.error('Error creating campaign:', error);
        return res
            .status(500)
            .json({ message: 'Server error while creating campaign' });
    }
});
exports.createCampaign = createCampaign;
const updateCampaign = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { campaignId } = req.params;
        const updates = req.body;
        const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'Authorization token required' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        const existingCampaign = yield campaignService_1.default.getCampaignById(campaignId);
        if (existingCampaign.enrolled_users[0].toString() !== userId) {
            return res
                .status(403)
                .json({ message: 'You are not authorized to update this campaign' });
        }
        if (req.file) {
            const imageUrl = yield (0, cloudinary_1.uploadToCloudinary)(req.file.buffer, 'campaign_images');
            updates.image_url = imageUrl;
        }
        const updatedCampaign = yield campaignService_1.default.updateCampaign(campaignId, updates, userId);
        return res.status(200).json({ campaign: updatedCampaign });
    }
    catch (error) {
        console.error('Error updating campaign:', error);
        return res
            .status(500)
            .json({ message: 'Server error while updating campaign' });
    }
});
exports.updateCampaign = updateCampaign;
const deleteCampaign = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log('Deleting campaign with ID:', req.params.campaignId); // Add logging here
        const { campaignId } = req.params;
        const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        if (!token)
            return res.status(401).json({ message: 'Authorization token required' });
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        const campaign = yield campaignService_1.default.deleteCampaign(campaignId);
        return res.status(200).json({
            message: 'Campaign deleted successfully',
            campaign: campaign
        });
    }
    catch (error) {
        console.error('Error deleting campaign:', error);
        return res
            .status(500)
            .json({ message: 'Server error while deleting campaign' });
    }
});
exports.deleteCampaign = deleteCampaign;
const getAllCampaigns = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const campaigns = yield campaignService_1.default.getAllCampaigns();
        return res.status(200).json({ campaigns });
    }
    catch (error) {
        console.error('Error fetching campaigns:', error);
        return res
            .status(500)
            .json({ message: 'Server error while fetching campaigns' });
    }
});
exports.getAllCampaigns = getAllCampaigns;
const getCampaignById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { campaignId } = req.params;
        const campaign = yield campaignService_1.default.getCampaignById(campaignId);
        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }
        return res.status(200).json({ campaign });
    }
    catch (error) {
        console.error('Error fetching campaign:', error);
        return res
            .status(500)
            .json({ message: 'Server error while fetching campaign' });
    }
});
exports.getCampaignById = getCampaignById;
