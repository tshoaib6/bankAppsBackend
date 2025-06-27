import express from "express";
import {
  createCampaign,
  deleteCampaign,
  updateCampaign,
  getAllCampaigns,
  getCampaignById,
  getCampaignsByBrandId,
} from "../controllers/campaignController";
import { upload } from "../middlewares/multer";
const router = express.Router();
router.post("/campaigns", upload.single("image"), createCampaign);
router.put("/campaigns/:campaignId", upload.single("image"), updateCampaign); 
router.put(
  "/updateCampaigns/:campaignId",
  upload.single("image"),
  updateCampaign
); // Update a campaign
router.delete("/campaigns/:campaignId", deleteCampaign); 
router.get("/getCampaigns", getAllCampaigns);
router.get("/getCampaignsById/:campaignId", getCampaignById);

router.get('/getCampaignByBrandId/:brandId', getCampaignsByBrandId); 

export default router;