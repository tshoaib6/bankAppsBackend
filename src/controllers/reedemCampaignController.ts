import { Request, Response } from 'express';
import Campaign from '../models/campaign.model';
import User from '../models/user.model';
import UserHistory from '../models/userHistory.model';
import jwt from 'jsonwebtoken';

// Redeem Campaign Controller
export const redeemCampaign = async (req: Request, res: Response): Promise<any> => {
  try {
    // Extract token from Authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Authorization token required' });
    
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.userId;

    const { campaignId } = req.body;

    // Check if the campaign exists
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user has enough points to redeem the campaign
    const pointsRequired = parseInt(campaign.points_required, 10); // Ensure points are a number for comparison
    if (user.points < pointsRequired) {
      return res.status(400).json({ message: 'Insufficient points to redeem this campaign' });
    }

    // Subtract points from the user
    user.points -= pointsRequired;
    await user.save();

    // Add a new entry in the UserHistory collection
    const userHistoryEntry = new UserHistory({
      user_id: user._id,
      date: new Date(),
      description: `Purchased campaign: ${campaign.title}`,
      points_used: pointsRequired.toString(),
      type: 'campaign_purchase',
      reference_id: campaignId,
    });
    await userHistoryEntry.save();

    // Add user to the campaign's enrolled users
    campaign.enrolled_users.push(userId);
    await campaign.save();

    // Send only necessary details in the response
    return res.status(200).json({
      message: 'Campaign redeemed successfully',
      user: {
        userId: user._id,
        username: user.name,  // Send username
        remaining_points: user.points,  // Send remaining points
      },
      campaign: {
        title: campaign.title,    // Send campaign title
        points_required: campaign.points_required,  // Send points required
        enrolled_users: campaign.enrolled_users,  // Send enrolled users
      },
      userHistory: {
        description: userHistoryEntry.description,  // Send description of the redemption
        points_used: userHistoryEntry.points_used,  // Send points used
        type: userHistoryEntry.type,  // Send type of the entry (campaign_purchase)
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
