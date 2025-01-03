import { Router } from 'express';
import { redeemCampaign,getCampaignDetails } from '../controllers/reedemCampaignController'; // Path to your controller file

const router = Router();

router.post('/redeem', redeemCampaign);
router.get('/redeemDetails/:campaignId', getCampaignDetails);

export default router;
