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
exports.getCampaignsWithLeaderboard = exports.getAllCampaigns = void 0;
const campaign_model_1 = __importDefault(require("../models/campaign.model"));
const userHistory_model_1 = __importDefault(require("../models/userHistory.model")); // adjust path if needed
// 🚀 Create campaign (now accepts brandId)
const createCampaign = (userId, data // brand is optional for backward compatibility
) => __awaiter(void 0, void 0, void 0, function* () {
    const newCampaign = new campaign_model_1.default(Object.assign(Object.assign({}, data), { enrolled_users: [], brand: data.brand || undefined }));
    return yield newCampaign.save();
});
// 🔍 Get a single campaign
const getCampaignById = (campaignId) => __awaiter(void 0, void 0, void 0, function* () {
    const campaign = yield campaign_model_1.default.findById(campaignId).populate('brand');
    if (!campaign)
        throw new Error('Campaign not found');
    // total redemption count for this campaign
    const totalRedemptions = yield userHistory_model_1.default.countDocuments({
        reference_id: campaignId,
        type: 'campaign_purchase',
    });
    // per-user redemption stats
    const userRedemptions = yield userHistory_model_1.default.aggregate([
        { $match: { reference_id: campaignId, type: 'campaign_purchase' } },
        {
            $group: {
                _id: "$user_id",
                redemptionCount: { $sum: 1 }
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "user"
            }
        },
        { $unwind: "$user" },
        {
            $project: {
                userId: "$user._id",
                username: "$user.username",
                redemptionCount: 1
            }
        }
    ]);
    return Object.assign(Object.assign({}, campaign.toObject()), { totalRedemptions,
        userRedemptions });
});
// ✏️ Update campaign (unchanged logic, preserved old user-based check)
const updateCampaign = (campaignId, updates, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const existingCampaign = yield campaign_model_1.default.findById(campaignId);
    if (!existingCampaign)
        throw new Error('Campaign not found');
    if (((_a = existingCampaign.enrolled_users[0]) === null || _a === void 0 ? void 0 : _a.toString()) !== userId) {
        throw new Error('You are not authorized to update this campaign');
    }
    const updatedCampaign = yield campaign_model_1.default.findByIdAndUpdate(campaignId, updates, { new: true });
    return updatedCampaign;
});
// 🗑️ Delete campaign
const deleteCampaign = (campaignId) => __awaiter(void 0, void 0, void 0, function* () {
    const campaign = yield campaign_model_1.default.findByIdAndDelete(campaignId);
    if (!campaign)
        throw new Error('Campaign not found');
    return campaign;
});
// 📥 Get all campaigns (optional brand filter)
const getAllCampaigns = (brandId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filter = brandId ? { brand: brandId } : {};
        return yield campaign_model_1.default.find(filter).populate('brand'); // 👈 include brand if requested
    }
    catch (error) {
        console.error('Error fetching campaigns from the database:', error);
        throw new Error('Error fetching campaigns');
    }
});
exports.getAllCampaigns = getAllCampaigns;
// 🔍 Get all campaigns by a specific brand ID
const getCampaignsByBrandId = (brandId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // const campaigns = await Campaign.find({ brand: brandId }).populate('brand');
        const campaigns = yield campaign_model_1.default.find({ brand: brandId });
        return campaigns;
    }
    catch (error) {
        console.error(`Error fetching campaigns for brand ${brandId}:`, error);
        throw new Error('Failed to fetch campaigns by brand ID');
    }
});
const getCampaignsWithLeaderboard = () => __awaiter(void 0, void 0, void 0, function* () {
    const campaigns = yield campaign_model_1.default.find()
        .populate("brand")
        .lean();
    const campaignData = yield Promise.all(campaigns.map((campaign) => __awaiter(void 0, void 0, void 0, function* () {
        // Aggregate redemptions for this campaign
        const redemptions = yield campaign_model_1.default.aggregate([
            { $match: { _id: campaign._id } },
            { $unwind: "$redemptions" }, // assuming redemptions stored in array
            {
                $group: {
                    _id: "$redemptions.user",
                    totalRedeems: { $sum: "$redemptions.count" },
                    lastRedeemedAt: { $max: "$redemptions.lastRedeemedAt" }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userInfo"
                }
            },
            { $unwind: "$userInfo" },
            {
                $project: {
                    userId: "$userInfo._id",
                    username: "$userInfo.username",
                    email: "$userInfo.email",
                    fullName: "$userInfo.name",
                    totalRedeems: 1,
                    lastRedeemedAt: 1
                }
            },
            { $sort: { totalRedeems: -1 } } // leaderboard sorted
        ]);
        return Object.assign(Object.assign({}, campaign), { leaderboard: redemptions });
    })));
    return campaignData;
});
exports.getCampaignsWithLeaderboard = getCampaignsWithLeaderboard;
exports.default = {
    createCampaign,
    updateCampaign,
    deleteCampaign,
    getCampaignById,
    getAllCampaigns: exports.getAllCampaigns,
    getCampaignsByBrandId,
    getCampaignsWithLeaderboard: exports.getCampaignsWithLeaderboard
};
