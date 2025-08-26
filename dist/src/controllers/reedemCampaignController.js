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
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const campaign_model_1 = __importDefault(require("../models/campaign.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const userHistory_model_1 = __importDefault(require("../models/userHistory.model"));
const redeemCampaign = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        if (!token)
            return res.status(401).json({ message: 'Authorization token required' });
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        const { campaignId } = req.body;
        if (!campaignId)
            return res.status(400).json({ message: 'Campaign ID is required' });
        const campaign = yield campaign_model_1.default.findById(campaignId)
            .populate('brand')
            .exec();
        if (!campaign)
            return res.status(404).json({ message: 'Campaign not found' });
        if (!campaign.brand || !campaign.brand._id) {
            return res.status(400).json({ message: 'Campaign has no associated brand' });
        }
        const brandId = campaign.brand._id.toString();
        const requiredPoints = parseInt(campaign.points_required, 10);
        const user = yield user_model_1.default.findById(userId).exec();
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        const userBrandPoints = user.brandPoints.find(bp => {
            var _a;
            return bp.brand instanceof mongoose_1.default.Types.ObjectId
                ? bp.brand.toString() === brandId
                : ((_a = bp.brand._id) === null || _a === void 0 ? void 0 : _a.toString()) === brandId;
        });
        if (!userBrandPoints || userBrandPoints.points < requiredPoints) {
            return res.status(400).json({ message: 'Insufficient brand points to redeem this campaign' });
        }
        // Deduct points
        userBrandPoints.points -= requiredPoints;
        yield user.save();
        // ✅ Update campaign redemptions
        const redemption = campaign.redemptions.find(r => r.user.toString() === user._id.toString());
        if (redemption) {
            redemption.count += 1;
            redemption.lastRedeemedAt = new Date();
        }
        else {
            campaign.redemptions.push({
                user: user._id,
                count: 1,
                lastRedeemedAt: new Date(),
            });
        }
        // Enroll user if not already enrolled
        if (!campaign.enrolled_users.includes(user._id.toString())) {
            campaign.enrolled_users.push(user._id.toString());
        }
        yield campaign.save();
        // Save user history
        const userHistoryEntry = new userHistory_model_1.default({
            user_id: user._id,
            date: new Date(),
            description: `Purchased campaign: ${campaign.title}`,
            points_used: requiredPoints,
            type: 'campaign_purchase',
            reference_id: campaignId,
            brand: campaign.brand._id,
        });
        yield userHistoryEntry.save();
        return res.status(200).json({
            message: 'Campaign redeemed successfully',
            user: {
                userId: user._id,
                username: user.name,
                remaining_points: userBrandPoints.points,
            },
            campaign: {
                title: campaign.title,
                points_required: campaign.points_required,
                enrolled_users: campaign.enrolled_users,
                redemptions: campaign.redemptions, // 👈 now includes redemption count
                brand: {
                    _id: campaign.brand._id,
                    brandName: campaign.brand.brandName,
                    description: campaign.brand.description,
                    logo: campaign.brand.logo,
                },
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
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});
exports.redeemCampaign = redeemCampaign;
const getCampaignDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        if (!token)
            return res.status(401).json({ message: 'Authorization token required' });
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        const { campaignId } = req.params;
        if (!campaignId)
            return res.status(400).json({ message: 'Campaign ID is required' });
        const campaign = yield campaign_model_1.default.findById(campaignId)
            .populate('brand')
            .exec();
        if (!campaign)
            return res.status(404).json({ message: 'Campaign not found' });
        if (!campaign.brand || !campaign.brand._id) {
            return res.status(400).json({ message: 'Campaign has no associated brand' });
        }
        const brandId = campaign.brand._id.toString();
        const user = yield user_model_1.default.findById(userId).exec();
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        const userBrandPoints = user.brandPoints.find(bp => {
            var _a;
            return bp.brand instanceof mongoose_1.default.Types.ObjectId
                ? bp.brand.toString() === brandId
                : ((_a = bp.brand._id) === null || _a === void 0 ? void 0 : _a.toString()) === brandId;
        });
        // ✅ get this user’s redemption count for the campaign
        const redemption = campaign.redemptions.find(r => r.user.toString() === user._id.toString());
        const redemptionCount = redemption ? redemption.count : 0;
        const userHistory = yield userHistory_model_1.default.find({
            user_id: user._id,
            reference_id: campaignId,
            type: 'campaign_purchase',
        });
        return res.status(200).json({
            message: 'Campaign details fetched successfully',
            user: {
                userId: user._id,
                username: user.name,
                remaining_points: (_b = userBrandPoints === null || userBrandPoints === void 0 ? void 0 : userBrandPoints.points) !== null && _b !== void 0 ? _b : 0,
                redemption_count: redemptionCount, // 👈 new field for how many times redeemed
            },
            campaign: {
                title: campaign.title,
                description: campaign.description,
                points_required: campaign.points_required,
                enrolled_users: campaign.enrolled_users,
                redemptions: campaign.redemptions, // 👈 show all redemptions for admin/analytics
                start_date: campaign.start_date,
                end_date: campaign.end_date,
                image_url: campaign.image_url,
                active: campaign.active,
                brand: {
                    _id: campaign.brand._id,
                    brandName: campaign.brand.brandName,
                    description: campaign.brand.description,
                    logo: campaign.brand.logo,
                },
            },
            userHistory: userHistory.map(uh => ({
                description: uh.description,
                points_used: uh.points_used,
                type: uh.type,
                date: uh.date,
            })),
        });
    }
    catch (error) {
        console.error('Error fetching campaign details:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});
exports.getCampaignDetails = getCampaignDetails;
