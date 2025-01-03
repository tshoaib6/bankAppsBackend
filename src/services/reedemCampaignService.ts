import Campaign, { ICampaign } from '../models/campaign.model';
import User, { IUser } from '../models/user.model';
import UserHistory from '../models/userHistory.model';

/**
 * Redeem a campaign for a user.
 * @param userId - ID of the user redeeming the campaign.
 * @param campaignId - ID of the campaign to redeem.
 * @returns Updated user data and campaign details.
 * @throws Error if the campaign or user does not exist, or if points are insufficient.
 */
export const redeemCampaignService = async (userId: string, campaignId: string) => {
  try {
    const campaign = await Campaign.findById(campaignId).exec();
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const pointsRequired = parseInt(campaign.points_required, 10);
    if (isNaN(pointsRequired)) {
      throw new Error('Invalid points requirement for the campaign');
    }

    const user = await User.findById(userId).exec();
    if (!user) {
      throw new Error('User not found');
    }

    if (user.points < pointsRequired) {
      throw new Error('Insufficient points to redeem this campaign');
    }

    user.points -= pointsRequired;
    await user.save();

    campaign.enrolled_users.push(userId);
    await campaign.save();

    const userHistoryEntry = new UserHistory({
      user_id: user._id,
      date: new Date(),
      description: `Redeemed campaign: ${campaign.title}`,
      points_used: pointsRequired.toString(),
      type: 'campaign_purchase',
      reference_id: campaignId,
    });
    await userHistoryEntry.save();

    return {
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
    };
  } catch (error: any) {
    console.error('Error redeeming campaign service:', error);
    throw new Error(error.message || 'An error occurred during campaign redemption');
  }
};
