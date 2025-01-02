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
    // Find the campaign and ensure it exists
    const campaign = await Campaign.findById(campaignId).exec();
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // Parse `points_required` to a number for comparison
    const pointsRequired = parseInt(campaign.points_required, 10);
    if (isNaN(pointsRequired)) {
      throw new Error('Invalid points requirement for the campaign');
    }

    // Find the user and ensure they exist
    const user = await User.findById(userId).exec();
    if (!user) {
      throw new Error('User not found');
    }

    // Ensure the user has enough points
    if (user.points < pointsRequired) {
      throw new Error('Insufficient points to redeem this campaign');
    }

    // Deduct points and save the updated user data
    user.points -= pointsRequired;
    await user.save();

    // Add the user to the enrolled users of the campaign
    campaign.enrolled_users.push(userId);
    await campaign.save();

    // Log the campaign purchase in the user's history
    const userHistoryEntry = new UserHistory({
      user_id: user._id,
      date: new Date(),
      description: `Redeemed campaign: ${campaign.title}`,
      points_used: pointsRequired.toString(),
      type: 'campaign_purchase',
      reference_id: campaignId,
    });
    await userHistoryEntry.save();

    // Return necessary details in the response
    return {
      user: {
        // username: user.username,  // Send only necessary user details
        userId: user._id,
        remaining_points: user.points,  // Send remaining points
      },
      campaign: {
        title: campaign.title,     // Send only necessary campaign details
        points_required: campaign.points_required,
        enrolled_users: campaign.enrolled_users,  // Send enrolled users
      },
      userHistory: {
        description: userHistoryEntry.description,  // Send relevant userHistory data
        points_used: userHistoryEntry.points_used,
        type: userHistoryEntry.type,
      },
    };
  } catch (error: any) {
    console.error('Error redeeming campaign service:', error);
    throw new Error(error.message || 'An error occurred during campaign redemption');
  }
};
