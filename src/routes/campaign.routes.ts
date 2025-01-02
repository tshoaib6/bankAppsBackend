import express from 'express';
import { 
  createBankPremium, 
  deleteBankPremium, 
  updateBankPremium, 
  getAllBankPremiums, 
  getBankPremiumById 
} from '../controllers/bankPremiumController';
import { upload } from '../middlewares/multer';

const router = express.Router();

router.post('/bankPremiums', upload.single('image'), createBankPremium); 
router.put('/updateBankPremiums/:bankPremiumId', upload.single('image'), updateBankPremium);
router.delete('/bankPremiums/:bankPremiumId', deleteBankPremium); 
router.get('/getBankPremiums', getAllBankPremiums); 
router.get('/getBankPremiumById/:bankPremiumId', getBankPremiumById); 
export default router;
