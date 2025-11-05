import express from "express";
import {
  createBankPremium,
  deleteBankPremium,
  updateBankPremium,
  getAllBankPremiums,
  getBankPremiumById,
  verifyBankPremiumCode,
  redeemBankPremium,
  getAllRedemptionsController,
  exportRedemptionsCSVController,
  getAllBankPremiumsControllerForAdmin,
} from "../controllers/bankPremiumController";
import { upload } from "../middlewares/multer";

const router = express.Router();

router.post("/bankPremiums", upload.single("image"), createBankPremium);
router.put(
  "/updateBankPremiums/:bankPremiumId",
  upload.single("image"),
  updateBankPremium
);
router.delete("/deleteBankPremiums/:bankPremiumId", deleteBankPremium);
router.get("/getBankPremiums", getAllBankPremiums);
router.get("/getBankPremiumsForAdmin", getAllBankPremiumsControllerForAdmin);

router.get("/getBankPremiumById/:bankPremiumId", getBankPremiumById);
// User redeem endpoint
router.post("/redeemBankPremium/:premiumId/redeem", redeemBankPremium);
router.get("/get-all-bank-premiums-redeemed", getAllRedemptionsController);
router.get("/exportCSVForBankPrem", exportRedemptionsCSVController);

// Admin verify/update status endpoint
// Route
router.put("/verifyCodeAndUpdateStatus", verifyBankPremiumCode);
export default router;
