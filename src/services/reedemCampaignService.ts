// import Campaign, { ICampaign } from '../models/campaign.model';
// import User from '../models/user.model';
// import UserHistory from '../models/userHistory.model';
// import { IBrand } from '../models/brand.model';

// /**
//  * Redeem a campaign for a user.
//  * @param userId - ID of the user redeeming the campaign.
//  * @param campaignId - ID of the campaign to redeem.
//  * @returns Updated user data and campaign details including full brand info.
//  * @throws Error if campaign or user not found or points insufficient.
//  */
// export const redeemCampaignService = async (userId: string, campaignId: string) => {
//   try {
//     const campaign = await Campaign.findById(campaignId)
//       .populate<{ brand: IBrand }>('brand')
//       .exec();

//     if (!campaign) {
//       throw new Error('Campaign not found');
//     }

//     const pointsRequired = parseInt(campaign.points_required, 10);
//     if (isNaN(pointsRequired)) {
//       throw new Error('Invalid points requirement for the campaign');
//     }

//     const user = await User.findById(userId).exec();
//     if (!user) {
//       throw new Error('User not found');
//     }

//     if (!campaign.brand || !campaign.brand._id) {
//       throw new Error('Campaign brand not properly populated');
//     }

//     const brandId = campaign.brand._id.toString();

//     // Find user's points for that brand
//     const brandPointsEntry = user.brandPoints.find(entry =>
//       entry.brand.toString() === brandId
//     );

//     if (!brandPointsEntry || brandPointsEntry.points < pointsRequired) {
//       throw new Error('You need to collect more points to redeem this campaign.');
//     }

//     // Deduct brand points
//     brandPointsEntry.points -= pointsRequired;
//     await user.save();

//     // Ensure enrolled_users contains this user
//     if (!campaign.enrolled_users.map(id => id.toString()).includes(user._id.toString())) {
//       campaign.enrolled_users.push(user._id.toString());
//     }

//     // ✅ Update redemptions count
//     const redemption = campaign.redemptions.find(
//       r => r.user.toString() === user._id.toString()
//     );

//     if (redemption) {
//       redemption.count += 1;
//       redemption.lastRedeemedAt = new Date();
//     } else {
//       campaign.redemptions.push({
//         user: user._id,
//         count: 1,
//         lastRedeemedAt: new Date(),
//       });
//     }

//     await campaign.save();

//     // Log user history
//     const userHistoryEntry = new UserHistory({
//       user_id: user._id,
//       date: new Date(),
//       description: `Redeemed campaign: ${campaign.title}`,
//       points_used: pointsRequired.toString(),
//       type: 'campaign_purchase',
//       reference_id: campaignId,
//       brand: campaign.brand._id,
//       points_earned: 0, // since this is a redemption
//       qrCode: null,
//     });

//     await userHistoryEntry.save();

//     return {
//       user: {
//         userId: user._id,
//         username: user.name,
//         remaining_brand_points: brandPointsEntry.points,
//         brandId: campaign.brand._id,
//       },
//       campaign: {
//         title: campaign.title,
//         points_required: campaign.points_required,
//         enrolled_users: campaign.enrolled_users,
//         redemptions: campaign.redemptions, // 👈 include redemption info
//         brand: {
//           _id: campaign.brand._id,
//           brandName: campaign.brand.brandName,
//           description: campaign.brand.description,
//           logo: campaign.brand.logo,
//           isActive: campaign.brand.isActive,
//         },
//       },
//       userHistory: {
//         description: userHistoryEntry.description,
//         points_used: userHistoryEntry.points_used,
//         type: userHistoryEntry.type,
//       },
//     };
//   } catch (error: any) {
//     console.error('Error redeeming campaign service:', error);
//     throw new Error(error.message || 'An error occurred during campaign redemption');
//   }
// };

import Campaign, { ICampaign } from '../models/campaign.model';
import User from '../models/user.model';
import UserHistory from '../models/userHistory.model';
import { IBrand } from '../models/brand.model';
import AdditionalItem from '../models/additionalItems.model';

/**
 * Redeem a campaign for a user.
 * @param userId - ID of the user redeeming the campaign.
 * @param campaignId - ID of the campaign to redeem.
 * @returns Updated user and campaign summary (minimal info)
 */
export const redeemAdditionalItemService = async (userId: string, itemId: string) => {
  try {
    // 🔹 Step 1: Fetch the additional item and populate brand
    const item = await AdditionalItem.findById(itemId)
      .populate('brand', 'brandName description logo isActive')
      .exec();

    if (!item) throw new Error('Item not found');

    // 🔹 Step 2: Validate points requirement
    const pointsRequired = parseInt(item.points_required, 10);
    if (isNaN(pointsRequired)) throw new Error('Invalid points requirement for this item');

    // 🔹 Step 3: Fetch the user
    const user = await User.findById(userId).exec();
    if (!user) throw new Error('User not found');

    // 🔹 Step 4: Ensure brand reference is valid
    let brandId: string;
    if (item.brand) {
      brandId =
        typeof item.brand === 'object' && '_id' in item.brand
          ? (item.brand as any)._id.toString()
          : (item.brand as any).toString();
    } else {
      throw new Error('Item brand not properly populated or missing');
    }

    // 🔹 Step 5: Locate the user's brand points entry
    const brandPointsEntry = user.brandPoints.find(
      (entry) =>
        entry.brand.toString() === brandId ||
        (entry.brand?._id && entry.brand._id.toString() === brandId)
    );

    if (!brandPointsEntry)
      throw new Error('Brand points entry not found for this brand.');

    if (brandPointsEntry.points < pointsRequired)
      throw new Error('You need to collect more points to redeem this item.');

    // 🔹 Step 6: Deduct brand points safely
    brandPointsEntry.points -= pointsRequired;
    user.markModified('brandPoints'); // ✅ Force Mongoose to detect nested array change
    await user.save();

    // 🔹 Step 7: Handle redemption logic
    const now = new Date();
    const redemptionCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    // Type-safe array access
    const redemptionsArray = item.redemptions as Array<{
      user: any;
      code: string;
      status: string;
      redeemedAt: Date;
    }>;

    const existingRedemption = redemptionsArray.find(
      (r) => r.user?.toString() === user._id.toString()
    );

    if (existingRedemption) {
      existingRedemption.redeemedAt = now;
      existingRedemption.status = 'pending';
      existingRedemption.code = redemptionCode;
    } else {
      item.redemptions.push({
        user: user._id,
        code: redemptionCode,
        status: 'pending',
        redeemedAt: now,
      } as any);
    }

    await item.save();

    // 🔹 Step 8: Add to user history
    const userHistoryEntry = new UserHistory({
      user_id: user._id,
      date: now,
      description: `Redeemed additional item: ${item.title}`,
      points_used: pointsRequired.toString(),
      type: 'additional_item_purchase',
      reference_id: itemId,
      brand: brandId,
      points_earned: 0,
      qrCode: null,
    });

    await userHistoryEntry.save();

    // 🔹 Step 9: Return a clean formatted response
    return {
      success: true,
      message: 'Item redeemed successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          remaining_brand_points: brandPointsEntry.points,
        },
        item: {
          id: item._id,
          title: item.title,
          points_required: item.points_required,
          redemption_code: redemptionCode,
          brand: {
            id: brandId,
            name:
              typeof item.brand === 'object' && 'brandName' in item.brand
                ? (item.brand as any).brandName
                : 'Unknown Brand',
          },
        },
      },
    };
  } catch (error: any) {
    console.error('Error redeeming additional item:', error);
    throw new Error(error.message || 'An error occurred during item redemption');
  }
};
