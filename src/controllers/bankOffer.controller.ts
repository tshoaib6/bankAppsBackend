import { Request, Response } from "express";
import {
    createBankOffer,
    getAllBankOffers,
    getBankOfferById,
    updateBankOffer,
    deleteBankOffer,
} from "../services/bankOffer.service";

// Create Offer
export const createBankOfferController = async (req: Request, res: Response): Promise<any> => {
    try {
        const newOffer = await createBankOffer(req.body);
        return res.status(201).json({ message: "Bank Offer created successfully", data: newOffer });
    } catch (error: any) {
        return res.status(500).json({ message: "Error creating offer", error: error.message });
    }
};

// Get All Offers
export const getAllBankOffersController = async (_req: Request, res: Response): Promise<any> => {
    try {
        const offers = await getAllBankOffers();
        return res.status(200).json({ data: offers });
    } catch (error: any) {
        return res.status(500).json({ message: "Error fetching offers", error: error.message });
    }
};

// Get Offer by ID
export const getBankOfferByIdController = async (req: Request, res: Response): Promise<any> => {
    try {
        const offer = await getBankOfferById(req.params.id);
        if (!offer) return res.status(404).json({ message: "Offer not found" });
        return res.status(200).json({ data: offer });
    } catch (error: any) {
        return res.status(500).json({ message: "Error fetching offer", error: error.message });
    }
};

// Update Offer
export const updateBankOfferController = async (req: Request, res: Response): Promise<any> => {
    try {
        const updatedOffer = await updateBankOffer(req.params.id, req.body);
        if (!updatedOffer) return res.status(404).json({ message: "Offer not found" });
        return res.status(200).json({ message: "Offer updated successfully", data: updatedOffer });
    } catch (error: any) {
        return res.status(500).json({ message: "Error updating offer", error: error.message });
    }
};

// Delete Offer
export const deleteBankOfferController = async (req: Request, res: Response): Promise<any> => {
    try {
        const deletedOffer = await deleteBankOffer(req.params.id);
        if (!deletedOffer) return res.status(404).json({ message: "Offer not found" });
        return res.status(200).json({ message: "Offer deleted successfully" });
    } catch (error: any) {
        return res.status(500).json({ message: "Error deleting offer", error: error.message });
    }
};
