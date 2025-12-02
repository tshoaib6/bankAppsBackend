import Campaign, { ICampaign } from "../models/campaign.model";
import User from "../models/user.model";
import UserHistory from "../models/userHistory.model"; // adjust path if needed

// 🚀 Create campaign (now accepts brandId)
const createCampaign = async (
  userId: string,
  data: Partial<ICampaign> & { brand?: string } // brand is optional for backward compatibility
) => {
  const newCampaign = new Campaign({
    ...data,
    enrolled_users: [],
    brand: data.brand || undefined, // 👈 Safely include brand if provided
  });
  return await newCampaign.save();
};

// // 🔍 Get a single campaign
// const getCampaignById = async (campaignId: string) => {
//   const campaign = await Campaign.findById(campaignId).populate('brand');
//   if (!campaign) throw new Error('Campaign not found');

//   // total redemption count for this campaign
//   const totalRedemptions = await UserHistory.countDocuments({
//     reference_id: campaignId,
//     type: 'Dmax Campagin Entry',
//   });

//   // per-user redemption stats
//   const userRedemptions = await UserHistory.aggregate([
//     { $match: { reference_id: campaignId, type: 'campaign_purchase' } },
//     {
//       $group: {
//         _id: "$user_id",
//         redemptionCount: { $sum: 1 }
//       }
//     },
//     {
//       $lookup: {
//         from: "users",
//         localField: "_id",
//         foreignField: "_id",
//         as: "user"
//       }
//     },
//     { $unwind: "$user" },
//     {
//       $project: {
//         userId: "$user._id",
//         username: "$user.username",
//         redemptionCount: 1
//       }
//     }
//   ]);

//   return {
//     ...campaign.toObject(),
//     totalRedemptions,
//     userRedemptions
//   };
// };

// 🔍 Get a single campaign
// const getCampaignById = async (campaignId: string) => {
//   const campaign = await Campaign.findById(campaignId).populate("brand");
//   if (!campaign) throw new Error("Campaign not found");

//   // total redemption count for this campaign
//   const totalRedemptions = await UserHistory.countDocuments({
//     reference_id: campaignId,
//     type: "Dmax Campagin Entry",
//   });

//   // per-user redemption stats
//   const userRedemptions = await UserHistory.aggregate([
//     { $match: { reference_id: campaignId, type: "campaign_purchase" } },
//     {
//       $group: {
//         _id: "$user_id",
//         redemptionCount: { $sum: 1 },
//       },
//     },
//     {
//       $lookup: {
//         from: "users",
//         localField: "_id",
//         foreignField: "_id",
//         as: "user",
//       },
//     },
//     { $unwind: "$user" },
//     {
//       $project: {
//         userId: "$user._id",
//         username: "$user.username",
//         redemptionCount: 1,
//       },
//     },
//   ]);

//   return {
//     ...campaign.toObject(),
//     totalRedemptions,
//     userRedemptions,
//   };
// };

// service file
const getCampaignById = async (campaignId: string) => {
  const campaign = await Campaign.findById(campaignId)
    .select("-redemptions -enrolled_users") // 🧹 directly exclude fields here
    .populate("brand");

  if (!campaign) throw new Error("Campaign not found");

  // total redemption count for this campaign
  const totalRedemptions = await UserHistory.countDocuments({
    reference_id: campaignId,
    type: "Dmax Campagin Entry",
  });

  // per-user redemption stats
  const userRedemptions = await UserHistory.aggregate([
    { $match: { reference_id: campaignId, type: "campaign_purchase" } },
    {
      $group: {
        _id: "$user_id",
        redemptionCount: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        userId: "$user._id",
        username: "$user.username",
        redemptionCount: 1,
      },
    },
  ]);

  // Return a cleaned response (already missing unwanted fields)
  return {
    ...campaign.toObject(),
    totalRedemptions,
    userRedemptions,
  };
};

// ✏️ Update campaign (unchanged logic, preserved old user-based check)
const updateCampaign = async (
  campaignId: string,
  updates: Partial<ICampaign>,
  userId: string
) => {
  const existingCampaign = await Campaign.findById(campaignId);
  if (!existingCampaign) throw new Error("Campaign not found");

  if (existingCampaign.enrolled_users[0]?.toString() !== userId) {
    throw new Error("You are not authorized to update this campaign");
  }

  const updatedCampaign = await Campaign.findByIdAndUpdate(
    campaignId,
    updates,
    { new: true }
  );
  return updatedCampaign;
};

// 🗑️ Delete campaign
const deleteCampaign = async (campaignId: string) => {
  const campaign = await Campaign.findByIdAndDelete(campaignId);
  if (!campaign) throw new Error("Campaign not found");
  return campaign;
};

export const getAllCampaigns = async (brandId?: string): Promise<ICampaign[]> => {
  try {
    const filter = brandId ? { brand: brandId } : {};

    // Fetch campaigns and populate only necessary brand fields
    const campaigns = await Campaign.find(filter)
      .populate("brand", "_id brandName") // ✅ only include _id and brandName
      .select("-enrolled_users -redemptions"); // ✅ exclude these fields

    return campaigns;
  } catch (error) {
    throw new Error("Error fetching campaigns");
  }
};


// 🔍 Get all campaigns by a specific brand ID
const getCampaignsByBrandId = async (brandId: string): Promise<ICampaign[]> => {
  try {
    // const campaigns = await Campaign.find({ brand: brandId }).populate('brand');
    const campaigns = await Campaign.find({ brand: brandId });

    return campaigns;
  } catch (error) {
    throw new Error("Failed to fetch campaigns by brand ID");
  }
};
export const getCampaignsWithLeaderboard = async () => {
  const campaigns = await Campaign.find().populate("brand").lean();

  const campaignData = await Promise.all(
    campaigns.map(async (campaign) => {
      // Aggregate redemptions for this campaign
      const redemptions = await Campaign.aggregate([
        { $match: { _id: campaign._id } },
        { $unwind: "$redemptions" },
        {
          $group: {
            _id: "$redemptions.user",
            totalRedeems: { $sum: "$redemptions.count" },
            lastRedeemedAt: { $max: "$redemptions.lastRedeemedAt" },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "userInfo",
          },
        },
        { $unwind: "$userInfo" },
        {
          $project: {
            userId: "$userInfo._id",
            username: "$userInfo.username",
            email: "$userInfo.email",
            fullName: "$userInfo.name",
            totalRedeems: 1,
            lastRedeemedAt: 1,
          },
        },
        { $sort: { totalRedeems: -1 } },
      ]);

      // 👉 Calculate total campaign redeems (sum of all users’ redeems)
      const totalCampaignRedeems = redemptions.reduce(
        (sum, r) => sum + (r.totalRedeems || 0),
        0
      );

      return {
        ...campaign,
        leaderboard: redemptions,
        totalCampaignRedeems, // ✅ added field
      };
    })
  );

  return campaignData;
};
export interface ICsvRow {
  campaignId: string;
  campaignName: string;
  userId: string;
  username: string;
  email: string;
  redeemedAt: string;
}

export const getCampaignRedemptionsCSVStream = async (
  campaignId: string
): Promise<AsyncGenerator<ICsvRow>> => {
  const campaign = await Campaign.findById(campaignId)
    .select("title redemptions")
    .lean();

  // ❌ type narrowing
  if (!campaign) throw new Error("Campaign not found");

  // ✅ Create a typed constant so TypeScript knows it’s not null
  const campaignNotNull: ICampaign & { _id: any } = campaign;

  async function* generator(): AsyncGenerator<ICsvRow> {
    for (const redemption of campaignNotNull.redemptions ?? []) {
      const user = await User.findById(redemption.user)
        .select("name email")
        .lean();
      if (!user) continue;

      for (let i = 0; i < redemption.count; i++) {
        yield {
          campaignId: campaignNotNull._id.toString(),
          campaignName: campaignNotNull.title,
          userId: user._id.toString(),
          username: user.name,
          email: user.email ?? "",
          redeemedAt: redemption.lastRedeemedAt.toISOString(),
        };
      }
    }
  }

  return generator();
};

export default {
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getCampaignById,
  getAllCampaigns,
  getCampaignsByBrandId,
  getCampaignsWithLeaderboard,
};
