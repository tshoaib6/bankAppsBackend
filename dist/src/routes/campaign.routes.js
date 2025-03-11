"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const campaignController_1 = require("../controllers/campaignController");
const multer_1 = require("../middlewares/multer");
const router = express_1.default.Router();
router.post("/campaigns", multer_1.upload.single("image"), campaignController_1.createCampaign); // Create a new campaign
router.put("/campaigns/:campaignId", multer_1.upload.single("image"), campaignController_1.updateCampaign); // Update a campaign
router.put("/updateCampaigns/:campaignId", multer_1.upload.single("image"), campaignController_1.updateCampaign); // Update a campaign
router.delete("/campaigns/:campaignId", campaignController_1.deleteCampaign); // Delete a campaign
router.get("/getCampaigns", campaignController_1.getAllCampaigns);
router.get("/getCampaignsById/:campaignId", campaignController_1.getCampaignById);
exports.default = router;
