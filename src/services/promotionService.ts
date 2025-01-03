import Promotion, { IPromotion } from '../models/promotion.model';

export const createPromotion = async (data: any): Promise<IPromotion> => {
  try {
    const promotion = new Promotion(data);
    await promotion.save();
    return promotion;
  } catch (error) {
    throw new Error('Error creating promotion');
  }
};

export const getPromotions = async (): Promise<IPromotion[]> => {
  try {
    return await Promotion.find();
  } catch (error) {
    throw new Error('Error fetching promotions');
  }
};

export const getPromotionById = async (promotionId: string): Promise<IPromotion | null> => {
  try {
    return await Promotion.findById(promotionId);
  } catch (error) {
    throw new Error('Error fetching promotion by ID');
  }
};
export const updatePromotion = async (promotionId: string, data: any): Promise<IPromotion | null> => {
    try {
      return await Promotion.findByIdAndUpdate(promotionId, data, { new: true });
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
