import { Request, Response } from 'express';
import Campaign from '../models/campaign.model';
import User from '../models/user.model';
import UserHistory from '../models/userHistory.model';
import jwt from 'jsonwebtoken';
import { IBrand } from '../models/brand.model';

export const redeemCampaign = async (req: Request, res: Response): Promise<any> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Authorization token required' });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.userId;

    const { campaignId } = req.body;

    const campaign = await Campaign.findById(campaignId)
      .populate<{ brand: IBrand }>('brand')
      .exec();
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
        brand: campaign.brand
          ? {
              _id: campaign.brand._id,
              brandName: campaign.brand.brandName,
              description: campaign.brand.description,
              logo: campaign.brand.logo,
            }
          : null,
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
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getCampaignDetails = async (req: Request, res: Response): Promise<any> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Authorization token required' });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.userId;

    const { campaignId } = req.params;
    if (!campaignId) {
      return res.status(400).json({ message: 'Campaign ID is required' });
    }

    const campaign = await Campaign.findById(campaignId)
      .populate<{ brand: IBrand }>('brand')
      .exec();

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

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
        description: campaign.description,
        points_required: campaign.points_required,
        enrolled_users: campaign.enrolled_users,
        start_date: campaign.start_date,
        end_date: campaign.end_date,
        image_url: campaign.image_url,
        active: campaign.active,
        brand: campaign.brand
          ? {
              _id: campaign.brand._id,
              brandName: campaign.brand.brandName,
              description: campaign.brand.description,
              logo: campaign.brand.logo,
            }
          : null,
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
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
