import express from 'express';
import {
  createBankPremium,
  deleteBankPremium,
  updateBankPremium,
  getAllBankPremiums,
  getBankPremiumById,
  verifyBankPremiumCode,
  redeemBankPremium
} from '../controllers/bankPremiumController';
import { upload } from '../middlewares/multer';

const router = express.Router();

router.post('/bankPremiums', upload.single('image'), createBankPremium);
router.put('/updateBankPremiums/:bankPremiumId', upload.single('image'), updateBankPremium);
router.delete('/deleteBankPremiums/:bankPremiumId', deleteBankPremium);
router.get('/getBankPremiums', getAllBankPremiums);
router.get('/getBankPremiumById/:bankPremiumId', getBankPremiumById);
// User redeem endpoint
router.post('/redeemBankPremium:premiumId/redeem', redeemBankPremium);

// Admin verify/update status endpoint
router.put('/verifyCodeAndUpdateStatus/:code', verifyBankPremiumCode);
export default router;
