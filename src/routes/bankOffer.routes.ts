import express from "express";
import {
    createBankOfferController,
    getAllBankOffersController,
    getBankOfferByIdController,
    updateBankOfferController,
    deleteBankOfferController,
} from "../controllers/bankOffer.controller";

const router = express.Router();

router.post("/bank-offers", createBankOfferController);
router.get("/get-bank-offers", getAllBankOffersController);
router.get("/get-bank-offer-by-id/:id", getBankOfferByIdController);
router.put("/update-bank-offer/:id", updateBankOfferController);
router.delete("/delete-bank-offers/:id", deleteBankOfferController);

export default router;
