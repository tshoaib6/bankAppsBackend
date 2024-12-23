import express from 'express';
import { createCampaign, deleteCampaign } from '../controllers/campaignController';
import { upload } from '../middlewares/multer';

const router = express.Router();

router.post('/campaigns', upload.single('image'), createCampaign); // Create a new campaign
// router.put('/campaigns/:campaignId', upload.single('image'), updateCampaign); // Update a campaign
router.delete('/campaigns/:campaignId', deleteCampaign); // Delete a campaign

export default router;
