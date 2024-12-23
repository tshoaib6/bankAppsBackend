import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import CampaignService from '../services/campaignService';
import { uploadToCloudinary } from '../utils/cloudinary';

export const createCampaign = async (req: Request, res: Response): Promise<any> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Authorization token required' });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.userId;

    const { title, description, points_required, start_date, end_date, active } = req.body;

    if (!req.file) return res.status(400).json({ message: 'Image is required' });

    // Upload image buffer to Cloudinary
    const imageUrl = await uploadToCloudinary(req.file.buffer, 'campaign_images');

    const campaignData = {
      title,
      description,
      points_required,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      image_url: imageUrl,
      active,
      enrolled_users: [],
    };

    const newCampaign = await CampaignService.createCampaign(userId, campaignData);
    return res.status(201).json({ campaign: newCampaign });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return res.status(500).json({ message: 'Server error while creating campaign' });
  }
};


// Update a campaign
// Update a campaign
export const updateCampaign = async (req: Request, res: Response): Promise<any> => {
  try {
    const { campaignId } = req.params;
    const updates = req.body;

    // Extract the userId from the authorization token
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.userId;

    // Fetch the existing campaign details using the new service method
    const existingCampaign = await CampaignService.getCampaignById(campaignId);

    // Check if the logged-in user is the creator of the campaign
    if (existingCampaign.enrolled_users[0].toString() !== userId) {
      return res.status(403).json({ message: 'You are not authorized to update this campaign' });
    }

    // If a new image file is uploaded, upload it to Cloudinary and update the image URL
    if (req.file) {
      const imageUrl = await uploadToCloudinary(req.file.path, 'campaign_images');
      updates.image_url = imageUrl;
    }

    // Update the campaign
    const updatedCampaign = await CampaignService.updateCampaign(campaignId, updates, userId);

    return res.status(200).json({ campaign: updatedCampaign });
  } catch (error) {
    console.error('Error updating campaign:', error);
    return res.status(500).json({ message: 'Server error while updating campaign' });
  }
};

// Delete a campaign
export const deleteCampaign = async (req: Request, res: Response): Promise<any> => {
  try {
    console.log('Deleting campaign with ID:', req.params.campaignId);  // Add logging here

    const { campaignId } = req.params;
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Authorization token required' });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.userId;

    const campaign = await CampaignService.deleteCampaign(campaignId);

    return res.status(200).json({
      message: 'Campaign deleted successfully',
      campaign: campaign,
    });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return res.status(500).json({ message: 'Server error while deleting campaign' });
  }
};

export const getAllCampaigns = async (req: Request, res: Response): Promise<any> => {
  try {
    // Fetch all campaigns from the database
    const campaigns = await CampaignService.getAllCampaigns();

    // Return the list of campaigns
    return res.status(200).json({ campaigns });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return res.status(500).json({ message: 'Server error while fetching campaigns' });
  }
};
export const getCampaignById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { campaignId } = req.params;

    // Fetch the campaign by its ID
    const campaign = await CampaignService.getCampaignById(campaignId);

    // If campaign is not found, return a 404 error
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Return the campaign
    return res.status(200).json({ campaign });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return res.status(500).json({ message: 'Server error while fetching campaign' });
  }
};