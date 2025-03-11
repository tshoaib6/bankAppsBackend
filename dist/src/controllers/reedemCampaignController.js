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
exports.getCampaignDetails = exports.redeemCampaign = void 0;
const campaign_model_1 = __importDefault(require("../models/campaign.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const userHistory_model_1 = __importDefault(require("../models/userHistory.model"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const redeemCampaign = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        if (!token)
            return res.status(401).json({ message: 'Authorization token required' });
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        const { campaignId } = req.body;
        const campaign = yield campaign_model_1.default.findById(campaignId);
        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }
        const user = yield user_model_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const pointsRequired = parseInt(campaign.points_required, 10);
        if (user.points < pointsRequired) {
            return res.status(400).json({ message: 'Insufficient points to redeem this campaign' });
        }
        user.points -= pointsRequired;
        yield user.save();
        const userHistoryEntry = new userHistory_model_1.default({
            user_id: user._id,
            date: new Date(),
            description: `Purchased campaign: ${campaign.title}`,
            points_used: pointsRequired.toString(),
            type: 'campaign_purchase',
            reference_id: campaignId,
        });
        yield userHistoryEntry.save();
        campaign.enrolled_users.push(userId);
        yield campaign.save();
        return res.status(200).json({
            message: 'Campaign redeemed successfully',
            user: {
                userId: user._id,
                username: user.name,
                remaining_points: user.points,
            },
            campaign: {
                title: campaign.title,
                points_required: campaign.points_required,
                enrolled_users: campaign.enrolled_users,
            },
            userHistory: {
                description: userHistoryEntry.description,
                points_used: userHistoryEntry.points_used,
                type: userHistoryEntry.type,
            },
        });
    }
    catch (error) {
        console.error('Error redeeming campaign:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }
        return res.status(500).json({ message: 'Internal server error', error });
    }
});
exports.redeemCampaign = redeemCampaign;
const getCampaignDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        if (!token)
            return res.status(401).json({ message: 'Authorization token required' });
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        const { campaignId } = req.params; // Assuming campaignId is passed as a route parameter
        if (!campaignId) {
            return res.status(400).json({ message: 'Campaign ID is required' });
        }
        // Fetch the campaign by ID
        const campaign = yield campaign_model_1.default.findById(campaignId);
        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }
        // Fetch the user by ID
        const user = yield user_model_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Fetch the user's history related to the campaign
        const userHistory = yield userHistory_model_1.default.findOne({
            user_id: user._id,
            reference_id: campaignId,
            type: 'campaign_purchase',
        });
        return res.status(200).json({
            message: 'Campaign details fetched successfully',
            user: {
                userId: user._id,
                username: user.name,
                remaining_points: user.points,
            },
            campaign: {
                title: campaign.title,
                points_required: campaign.points_required,
                enrolled_users: campaign.enrolled_users,
                description: campaign.description,
                start_date: campaign.start_date,
                end_date: campaign.end_date,
                image_url: campaign.image_url,
                active: campaign.active,
            },
            userHistory: userHistory
                ? {
                    description: userHistory.description,
                    points_used: userHistory.points_used,
                    type: userHistory.type,
                }
                : null,
        });
    }
    catch (error) {
        console.error('Error fetching campaign details:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }
        return res.status(500).json({ message: 'Internal server error', error });
    }
});
exports.getCampaignDetails = getCampaignDetails;
