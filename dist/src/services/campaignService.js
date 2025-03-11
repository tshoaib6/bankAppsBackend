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
exports.getAllCampaigns = void 0;
const campaign_model_1 = __importDefault(require("../models/campaign.model"));
const createCampaign = (userId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const newCampaign = new campaign_model_1.default(Object.assign(Object.assign({}, data), { enrolled_users: [] }));
    return yield newCampaign.save();
});
const getCampaignById = (campaignId) => __awaiter(void 0, void 0, void 0, function* () {
    const campaign = yield campaign_model_1.default.findById(campaignId);
    if (!campaign)
        throw new Error('Campaign not found');
    return campaign;
});
const updateCampaign = (campaignId, updates, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const existingCampaign = yield campaign_model_1.default.findById(campaignId);
    if (!existingCampaign)
        throw new Error('Campaign not found');
    if (existingCampaign.enrolled_users[0].toString() !== userId) {
        throw new Error('You are not authorized to update this campaign');
    }
    const updatedCampaign = yield campaign_model_1.default.findByIdAndUpdate(campaignId, updates, { new: true });
    return updatedCampaign;
});
const deleteCampaign = (campaignId) => __awaiter(void 0, void 0, void 0, function* () {
    const campaign = yield campaign_model_1.default.findByIdAndDelete(campaignId);
    if (!campaign)
        throw new Error('Campaign not found');
    return campaign;
});
const getAllCampaigns = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield campaign_model_1.default.find();
    }
    catch (error) {
        console.error('Error fetching campaigns from the database:', error);
        throw new Error('Error fetching campaigns');
    }
});
exports.getAllCampaigns = getAllCampaigns;
exports.default = {
    createCampaign,
    updateCampaign,
    deleteCampaign,
    getCampaignById,
    getAllCampaigns: exports.getAllCampaigns
};
