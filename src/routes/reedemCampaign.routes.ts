import { Router } from 'express';
import { redeemCampaign } from '../controllers/reedemCampaignController'; // Path to your controller file

const router = Router();

router.post('/redeem', redeemCampaign);

export default router;
