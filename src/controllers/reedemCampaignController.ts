import { Request, Response } from 'express';
import Campaign from '../models/campaign.model';
import User from '../models/user.model';
import UserHistory from '../models/userHistory.model';
import jwt from 'jsonwebtoken';

export const redeemCampaign = async (req: Request, res: Response): Promise<any> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Authorization token required' });
    
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.userId;

    const { campaignId } = req.body;

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const pointsRequired = parseInt(campaign.points_required, 10); 
    if (user.points < pointsRequired) {
      return res.status(400).json({ message: 'Insufficient points to redeem this campaign' });
    }

    user.points -= pointsRequired;
    await user.save();

    const userHistoryEntry = new UserHistory({
      user_id: user._id,
      date: new Date(),
      description: `Purchased campaign: ${campaign.title}`,
      points_used: pointsRequired.toString(),
      type: 'campaign_purchase',
      reference_id: campaignId,
    });
    await userHistoryEntry.save();

    campaign.enrolled_users.push(userId);
    await campaign.save();

    return res.status(200).json({
      message: 'Campaign redeemed successfully',
      user: {
        userId: user._id,
        username: user.name, 
        remaining_points: user.points, 
      },
      campaign: {
        title: campaign.title,    
        points_required: campaign.points_required,  
        enrolled_users: campaign.enrolled_users, 
      },
      userHistory: {
        description: userHistoryEntry.description,  
        points_used: userHistoryEntry.points_used, 
        type: userHistoryEntry.type,  
      },
    });
  } catch (error: any) {
    console.error('Error redeeming campaign:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

export const getCampaignDetails = async (req: Request, res: Response): Promise<any> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Authorization token required' });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.userId;

    const { campaignId } = req.params;  // Assuming campaignId is passed as a route parameter

    if (!campaignId) {
      return res.status(400).json({ message: 'Campaign ID is required' });
    }

    // Fetch the campaign by ID
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Fetch the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch the user's history related to the campaign
    const userHistory = await UserHistory.findOne({
      user_id: user._id,
      reference_id: campaignId,
      type: 'campaign_purchase',
    });

    return res.status(200).json({
      message: 'Campaign details fetched successfully',
      user: {
        userId: user._id,
        username: user.name,
        remaining_points: user.points,
      },
      campaign: {
        title: campaign.title,
        points_required: campaign.points_required,
        enrolled_users: campaign.enrolled_users,
        description: campaign.description,
        start_date: campaign.start_date,
        end_date: campaign.end_date,
        image_url: campaign.image_url,
        active: campaign.active,
      },
      userHistory: userHistory
        ? {
            description: userHistory.description,
            points_used: userHistory.points_used,
            type: userHistory.type,
          }
        : null,
    });
  } catch (error: any) {
    console.error('Error fetching campaign details:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
    return res.status(500).json({ message: 'Internal server error', error });
  }
};