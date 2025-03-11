"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reedemCampaignController_1 = require("../controllers/reedemCampaignController"); // Path to your controller file
const router = (0, express_1.Router)();
router.post('/redeem', reedemCampaignController_1.redeemCampaign);
router.get('/redeemDetails/:campaignId', reedemCampaignController_1.getCampaignDetails);
exports.default = router;
