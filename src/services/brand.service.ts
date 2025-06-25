import Brand, { IBrand } from '../models/brand.model';
import mongoose from 'mongoose';

export const createBrand = async (data: Partial<IBrand>): Promise<IBrand> => {
  const brand = new Brand(data);
  return await brand.save();
};

export const getAllBrands = async (): Promise<IBrand[]> => {
  return await Brand.find().sort({ createdAt: -1 });
};

export const getBrandById = async (id: string): Promise<IBrand | null> => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return await Brand.findById(id);
};

export const updateBrand = async (
  id: string,
  updates: Partial<IBrand>
): Promise<IBrand | null> => {
  return await Brand.findByIdAndUpdate(id, updates, { new: true });
};

export const deleteBrand = async (id: string): Promise<IBrand | null> => {
  return await Brand.findByIdAndDelete(id);
};
