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
 * @returns Updated user data and campaign details.
 * @throws Error if the campaign or user does not exist, or if points are insufficient.
 */
const redeemCampaignService = (userId, campaignId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const campaign = yield campaign_model_1.default.findById(campaignId).exec();
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
        if (user.points < pointsRequired) {
            throw new Error('Insufficient points to redeem this campaign');
        }
        user.points -= pointsRequired;
        yield user.save();
        campaign.enrolled_users.push(userId);
        yield campaign.save();
        const userHistoryEntry = new userHistory_model_1.default({
            user_id: user._id,
            date: new Date(),
            description: `Redeemed campaign: ${campaign.title}`,
            points_used: pointsRequired.toString(),
            type: 'campaign_purchase',
            reference_id: campaignId,
        });
        yield userHistoryEntry.save();
        return {
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
        };
    }
    catch (error) {
        console.error('Error redeeming campaign service:', error);
        throw new Error(error.message || 'An error occurred during campaign redemption');
    }
});
exports.redeemCampaignService = redeemCampaignService;
