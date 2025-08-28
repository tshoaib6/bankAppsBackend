import { Request, Response } from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import Campaign from '../models/campaign.model';
import User from '../models/user.model';
import UserHistory from '../models/userHistory.model';
import { IBrand } from '../models/brand.model';

export const redeemCampaign = async (req: Request, res: Response): Promise<any> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Authorization token required' });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.userId;

    const { campaignId } = req.body;
    if (!campaignId) return res.status(400).json({ message: 'Campaign ID is required' });

    const campaign = await Campaign.findById(campaignId)
      .populate<{ brand: IBrand }>('brand')
      .exec();

    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    if (!campaign.brand || !campaign.brand._id) {
      return res.status(400).json({ message: 'Campaign has no associated brand' });
    }

    const brandId = campaign.brand._id.toString();
    const requiredPoints = parseInt(campaign.points_required, 10);

    const user = await User.findById(userId).exec();
    if (!user) return res.status(404).json({ message: 'User not found' });

    // ✅ Collect all brand points for this brand
    const userBrandPointsArray = user.brandPoints.filter(bp =>
      bp.brand instanceof mongoose.Types.ObjectId
        ? bp.brand.toString() === brandId
        : (bp.brand as any)._id?.toString() === brandId
    );

    // ✅ Sum total points across all entries
    const totalBrandPoints = userBrandPointsArray.reduce((sum, bp) => sum + bp.points, 0);

    if (totalBrandPoints < requiredPoints) {
      return res.status(400).json({ message: 'You need to collect more points to redeem this campaign.' });
    }

    // ✅ Deduct points across entries
    let pointsToDeduct = requiredPoints;
    for (const bp of userBrandPointsArray) {
      if (pointsToDeduct <= 0) break;

      if (bp.points <= pointsToDeduct) {
        pointsToDeduct -= bp.points;
        bp.points = 0; // use up this entry
      } else {
        bp.points -= pointsToDeduct;
        pointsToDeduct = 0; // finished deduction
      }
    }

    await user.save();

    // ✅ Update campaign redemptions
    const redemption = campaign.redemptions.find(r => r.user.toString() === user._id.toString());
    if (redemption) {
      redemption.count += 1;
      redemption.lastRedeemedAt = new Date();
    } else {
      campaign.redemptions.push({
        user: user._id,
        count: 1,
        lastRedeemedAt: new Date(),
      });
    }

    // Enroll user if not already enrolled
    if (!campaign.enrolled_users.includes(user._id.toString())) {
      campaign.enrolled_users.push(user._id.toString());
    }

    await campaign.save();

    // Save user history
    const userHistoryEntry = new UserHistory({
      user_id: user._id,
      date: new Date(),
      description: `Purchased campaign: ${campaign.title}`,
      points_used: requiredPoints,
      type: 'campaign_purchase',
      reference_id: campaignId,
      brand: campaign.brand._id,
    });
    await userHistoryEntry.save();

    return res.status(200).json({
      message: 'Campaign redeemed successfully',
      user: {
        userId: user._id,
        username: user.name,
        remaining_points: totalBrandPoints - requiredPoints, // ✅ reflect total remaining
      },
      campaign: {
        title: campaign.title,
        points_required: campaign.points_required,
        enrolled_users: campaign.enrolled_users,
        redemptions: campaign.redemptions, // 👈 now includes redemption count
        brand: {
          _id: campaign.brand._id,
          brandName: campaign.brand.brandName,
          description: campaign.brand.description,
          logo: campaign.brand.logo,
        },
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
    if (!campaignId) return res.status(400).json({ message: 'Campaign ID is required' });

    const campaign = await Campaign.findById(campaignId)
      .populate<{ brand: IBrand }>('brand')
      .exec();

    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    if (!campaign.brand || !campaign.brand._id) {
      return res.status(400).json({ message: 'Campaign has no associated brand' });
    }

    const brandId = campaign.brand._id.toString();

    const user = await User.findById(userId).exec();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const userBrandPoints = user.brandPoints.find(bp =>
      bp.brand instanceof mongoose.Types.ObjectId
        ? bp.brand.toString() === brandId
        : (bp.brand as any)._id?.toString() === brandId
    );

    // ✅ get this user’s redemption count for the campaign
    const redemption = campaign.redemptions.find(r => r.user.toString() === user._id.toString());
    const redemptionCount = redemption ? redemption.count : 0;

    const userHistory = await UserHistory.find({
      user_id: user._id,
      reference_id: campaignId,
      type: 'campaign_purchase',
    });

    return res.status(200).json({
      message: 'Campaign details fetched successfully',
      user: {
        userId: user._id,
        username: user.name,
        remaining_points: userBrandPoints?.points ?? 0,
        redemption_count: redemptionCount, // 👈 new field for how many times redeemed
      },
      campaign: {
        title: campaign.title,
        description: campaign.description,
        points_required: campaign.points_required,
        enrolled_users: campaign.enrolled_users,
        redemptions: campaign.redemptions, // 👈 show all redemptions for admin/analytics
        start_date: campaign.start_date,
        end_date: campaign.end_date,
        image_url: campaign.image_url,
        active: campaign.active,
        brand: {
          _id: campaign.brand._id,
          brandName: campaign.brand.brandName,
          description: campaign.brand.description,
          logo: campaign.brand.logo,
        },
      },
      userHistory: userHistory.map(uh => ({
        description: uh.description,
        points_used: uh.points_used,
        type: uh.type,
        date: uh.date,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching campaign details:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
