import express from 'express';
import { createCampaign, deleteCampaign, updateCampaign, getAllCampaigns, getCampaignById } from '../controllers/campaignController';
import { upload } from '../middlewares/multer';

const router = express.Router();

router.post('/campaigns', upload.single('image'), createCampaign); // Create a new campaign
router.put('/updateCampaigns/:campaignId', upload.single('image'), updateCampaign); // Update a campaign
router.delete('/campaigns/:campaignId', deleteCampaign); // Delete a campaign
router.get('/getCampaigns', getAllCampaigns);
router.get('/getCampaignsById/:campaignId', getCampaignById);

export default router;
