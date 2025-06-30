import Campaign, { ICampaign } from '../models/campaign.model';
import User, { IUser } from '../models/user.model';
import UserHistory from '../models/userHistory.model';
import Brand, { IBrand } from '../models/brand.model';

/**
 * Redeem a campaign for a user.
 * @param userId - ID of the user redeeming the campaign.
 * @param campaignId - ID of the campaign to redeem.
 * @returns Updated user data and campaign details including full brand info.
 * @throws Error if campaign or user not found or points insufficient.
 */
export const redeemCampaignService = async (userId: string, campaignId: string) => {
  try {
    const campaign = await Campaign.findById(campaignId)
      .populate<{ brand: IBrand }>('brand')
      .exec();

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

    // Deduct points
    user.points -= pointsRequired;
    await user.save();

    // Enroll user
    campaign.enrolled_users.push(userId);
    await campaign.save();

    // Log history
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
        brand: campaign.brand
          ? {
              _id: campaign.brand._id,
              brandName: campaign.brand.brandName,
              description: campaign.brand.description,
              logo: campaign.brand.logo,
              isActive: campaign.brand.isActive,
            }
          : null,
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
