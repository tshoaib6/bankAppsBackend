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

router.post('/bankPremiums', upload.single('image'), createBankPremium); // Create a new BankPremium
router.put('/updateBankPremiums/:bankPremiumId', upload.single('image'), updateBankPremium); // Update a BankPremium
router.delete('/deleteBankPremiums/:bankPremiumId', deleteBankPremium); // Delete a BankPremium
router.get('/getBankPremiums', getAllBankPremiums); // Get all BankPremiums
router.get('/getBankPremiumById/:bankPremiumId', getBankPremiumById); // Get a BankPremium by ID

export default router;
