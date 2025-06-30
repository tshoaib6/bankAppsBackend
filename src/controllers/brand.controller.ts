import { Request, Response } from 'express';
import {
  createBrandService,
  getAllBrandsService,
  getBrandByIdService,
  updateBrandService,
  updateBrandStatusService,
  deleteBrandService,
} from '../services/brand.service';
import { IBrand } from '../models/brand.model';

export const createBrand = async (req: Request, res: Response): Promise<any> => {
  try {
    const { brandName, description } = req.body;

    if (!brandName) {
      return res.status(400).json({ message: 'Brand name is required' });
    }

    let logo: string | undefined;

    if (req.file) {
      // Convert image buffer to base64
      const base64Image = req.file.buffer.toString('base64');
      const mimeType = req.file.mimetype;
      logo = `data:${mimeType};base64,${base64Image}`;
    }

    const brand = await createBrandService(brandName, description, logo);
    res.status(201).json({ message: 'Brand created successfully', brand });
  } catch (error) {
    console.error('Error creating brand:', error);
    res.status(500).json({ message: 'Failed to create brand' });
  }
};

export const getAllBrands = async (_req: Request, res: Response):Promise<any> => {
  try {
    const brands = await getAllBrandsService();
    if (!brands.length) return res.status(404).json({ message: 'No brands found' });
    res.status(200).json({ brands });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch brands' });
  }
};

export const getBrandById = async (req: Request, res: Response):Promise<any> => {
  try {
    const brand = await getBrandByIdService(req.params.id);
    if (!brand) return res.status(404).json({ message: 'Brand not found' });
    res.status(200).json({ brand });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving brand' });
  }
};

export const updateBrand = async (req: Request, res: Response): Promise<any> => {
  try {
    const updates: Partial<IBrand> = { ...req.body };

    if (req.file) {
      const base64Image = req.file.buffer.toString('base64');
      const mimeType = req.file.mimetype;
      updates.logo = `data:${mimeType};base64,${base64Image}`;
    }

    const updatedBrand = await updateBrandService(req.params.id, updates);
    if (!updatedBrand) return res.status(404).json({ message: 'Brand not found' });

    res.status(200).json({ message: 'Brand updated successfully', updatedBrand });
  } catch (error) {
    console.error('Error updating brand:', error);
    res.status(500).json({ message: 'Failed to update brand' });
  }
};


export const updateBrandStatus = async (req: Request, res: Response):Promise<any> => {
  try {
    const { isActive } = req.body;
    const updated = await updateBrandStatusService(req.params.id, isActive);
    if (!updated) return res.status(404).json({ message: 'Brand not found' });
    res.status(200).json({ message: 'Brand status updated successfully', updated });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update brand status' });
  }
};

export const deleteBrand = async (req: Request, res: Response):Promise<any> => {
  try {
    const deleted = await deleteBrandService(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Brand not found' });
    res.status(200).json({ message: 'Brand deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete brand' });
  }
};
