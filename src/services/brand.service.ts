import Brand, { IBrand } from '../models/brand.model';

export const createBrandService = async (
  brandName: string,
  description?: string,
  logo?: string
): Promise<IBrand> => {
  const existing = await Brand.findOne({ brandName });
  if (existing) throw new Error('Brand name already exists');

  const newBrand = new Brand({ brandName, description, logo });
  return await newBrand.save();
};

export const getAllBrandsService = async (): Promise<IBrand[]> => {
  return await Brand.find();
};

export const getBrandByIdService = async (id: string): Promise<IBrand | null> => {
  return await Brand.findById(id);
};

export const updateBrandService = async (
  id: string,
  updates: Partial<IBrand>
): Promise<IBrand | null> => {
  return await Brand.findByIdAndUpdate(id, updates, { new: true });
};

export const updateBrandStatusService = async (
  id: string,
  isActive: boolean
): Promise<IBrand | null> => {
  return await Brand.findByIdAndUpdate(id, { isActive }, { new: true });
};

export const deleteBrandService = async (id: string): Promise<IBrand | null> => {
  return await Brand.findByIdAndDelete(id);
};
