import { Request, Response } from 'express';
import * as BrandService from '../services/brand.service';

export const createBrand = async (req: Request, res: Response) => {
  try {
    const brand = await BrandService.createBrand(req.body);
    res.status(201).json(brand);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create brand', error });
  }
};

export const getAllBrands = async (_req: Request, res: Response) => {
  try {
    const brands = await BrandService.getAllBrands();
    res.status(200).json(brands);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch brands', error });
  }
};

export const getBrandById = async (req: Request, res: Response):Promise<any> => {
  try {
    const brand = await BrandService.getBrandById(req.params.id);
    if (!brand) return res.status(404).json({ message: 'Brand not found' });
    res.status(200).json(brand);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch brand', error });
  }
};

export const updateBrand = async (req: Request, res: Response):Promise<any> => {
  try {
    const updatedBrand = await BrandService.updateBrand(req.params.id, req.body);
    if (!updatedBrand) return res.status(404).json({ message: 'Brand not found' });
    res.status(200).json(updatedBrand);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update brand', error });
  }
};

export const deleteBrand = async (req: Request, res: Response):Promise<any> => {
  try {
    const deleted = await BrandService.deleteBrand(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Brand not found' });
    res.status(200).json({ message: 'Brand deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete brand', error });
  }
};
