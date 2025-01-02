import { Router } from 'express';
import { redeemCampaign } from '../controllers/reedemCampaignController'; // Path to your controller file

const router = Router();

// Route to redeem a campaign
router.post('/redeem', redeemCampaign);

export default router;
