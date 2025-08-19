import BankOffer, { IBankOffer } from "../models/bankOffer.model";

// Create Offer
export const createBankOffer = async (offerData: Partial<IBankOffer>): Promise<IBankOffer> => {
    const offer = new BankOffer(offerData);
    return await offer.save();
};

// Get All Offers
export const getAllBankOffers = async (): Promise<IBankOffer[]> => {
    return await BankOffer.find().sort({ createdAt: -1 });
};

// Get Offer by ID
export const getBankOfferById = async (id: string): Promise<IBankOffer | null> => {
    return await BankOffer.findById(id);
};

// Update Offer
export const updateBankOffer = async (id: string, updateData: Partial<IBankOffer>): Promise<IBankOffer | null> => {
    return await BankOffer.findByIdAndUpdate(id, updateData, { new: true });
};

// Delete Offer
export const deleteBankOffer = async (id: string): Promise<IBankOffer | null> => {
    return await BankOffer.findByIdAndDelete(id);
};
