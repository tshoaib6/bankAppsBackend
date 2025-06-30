import Promotion, { IPromotion } from '../models/promotion.model';

// Create promotion with optional brand
export const createPromotion = async (data: any): Promise<IPromotion> => {
  try {
    const promotion = new Promotion(data) // includes optional brand
    await promotion.save()
    return promotion
  } catch (error: any) {
    console.error('Error in createPromotion service:', error.message, error)
    throw new Error('Error creating promotion')
  }
}
// Get all promotions (across all brands)
export const getPromotions = async (): Promise<IPromotion[]> => {
  try {
    return await Promotion.find().populate('brand'); // populate for visibility
  } catch (error) {
    throw new Error('Error fetching promotions');
  }
};

// ✅ NEW: Get promotions by brand ID
export const getPromotionsByBrand = async (brandId: string): Promise<IPromotion[]> => {
  try {
    return await Promotion.find({ brand: brandId }).populate('brand');
  } catch (error) {
    throw new Error('Error fetching promotions by brand');
  }
};

export const getPromotionById = async (promotionId: string): Promise<IPromotion | null> => {
  try {
    return await Promotion.findById(promotionId).populate('brand');
  } catch (error) {
    throw new Error('Error fetching promotion by ID');
  }
};

export const updatePromotion = async (promotionId: string, data: any): Promise<IPromotion | null> => {
  try {
    return await Promotion.findByIdAndUpdate(promotionId, data, { new: true }).populate('brand');
  } catch (error) {
    console.error('Error updating promotion:', error);
    throw new Error('Error updating promotion');
  }
};

export const deletePromotion = async (promotionId: string): Promise<IPromotion | null> => {
  try {
    return await Promotion.findByIdAndDelete(promotionId);
  } catch (error) {
    throw new Error('Error deleting promotion');
  }
};

export const getPromotionsByBrandId = async (brandId: string): Promise<IPromotion[]> => {
  try {
    return await Promotion.find({ brand: brandId }).populate('brand');
  } catch (error) {
    throw new Error('Error fetching promotions by brand');
  }
};