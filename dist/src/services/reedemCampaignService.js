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
exports.redeemCampaignService = void 0;
const campaign_model_1 = __importDefault(require("../models/campaign.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const userHistory_model_1 = __importDefault(require("../models/userHistory.model"));
/**
 * Redeem a campaign for a user.
 * @param userId - ID of the user redeeming the campaign.
 * @param campaignId - ID of the campaign to redeem.
 * @returns Updated user data and campaign details including full brand info.
 * @throws Error if campaign or user not found or points insufficient.
 */
const redeemCampaignService = (userId, campaignId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const campaign = yield campaign_model_1.default.findById(campaignId)
            .populate('brand')
            .exec();
        if (!campaign) {
            throw new Error('Campaign not found');
        }
        const pointsRequired = parseInt(campaign.points_required, 10);
        if (isNaN(pointsRequired)) {
            throw new Error('Invalid points requirement for the campaign');
        }
        const user = yield user_model_1.default.findById(userId).exec();
        if (!user) {
            throw new Error('User not found');
        }
        if (!campaign.brand || !campaign.brand._id) {
            throw new Error('Campaign brand not properly populated');
        }
        const brandId = campaign.brand._id.toString();
        // Find user's points for that brand
        const brandPointsEntry = user.brandPoints.find(entry => entry.brand.toString() === brandId);
        if (!brandPointsEntry || brandPointsEntry.points < pointsRequired) {
            throw new Error('Insufficient points in this brand to redeem the campaign');
        }
        // Deduct brand points
        brandPointsEntry.points -= pointsRequired;
        yield user.save();
        // Ensure enrolled_users contains this user
        if (!campaign.enrolled_users.map(id => id.toString()).includes(user._id.toString())) {
            campaign.enrolled_users.push(user._id.toString());
        }
        // ✅ Update redemptions count
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
        yield campaign.save();
        // Log user history
        const userHistoryEntry = new userHistory_model_1.default({
            user_id: user._id,
            date: new Date(),
            description: `Redeemed campaign: ${campaign.title}`,
            points_used: pointsRequired.toString(),
            type: 'campaign_purchase',
            reference_id: campaignId,
            brand: campaign.brand._id,
            points_earned: 0, // since this is a redemption
            qrCode: null,
        });
        yield userHistoryEntry.save();
        return {
            user: {
                userId: user._id,
                username: user.name,
                remaining_brand_points: brandPointsEntry.points,
                brandId: campaign.brand._id,
            },
            campaign: {
                title: campaign.title,
                points_required: campaign.points_required,
                enrolled_users: campaign.enrolled_users,
                redemptions: campaign.redemptions, // 👈 include redemption info
                brand: {
                    _id: campaign.brand._id,
                    brandName: campaign.brand.brandName,
                    description: campaign.brand.description,
                    logo: campaign.brand.logo,
                    isActive: campaign.brand.isActive,
                },
            },
            userHistory: {
                description: userHistoryEntry.description,
                points_used: userHistoryEntry.points_used,
                type: userHistoryEntry.type,
            },
        };
    }
    catch (error) {
        console.error('Error redeeming campaign service:', error);
        throw new Error(error.message || 'An error occurred during campaign redemption');
    }
});
exports.redeemCampaignService = redeemCampaignService;
