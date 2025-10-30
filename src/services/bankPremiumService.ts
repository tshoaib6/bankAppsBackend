import BankPremium, { IBankPremium } from '../models/bankPremium.model';
import User from '../models/user.model';
import UserHistory from '../models/userHistory.model';
import { IBrand } from '../models/brand.model';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Document, Types } from "mongoose";
import { sendRedeemSuccessEmail } from '../utils/sendRedeemSuccessEmail';
import { Parser } from 'json2csv';

export interface IBrandPoints {
  _id?: Types.ObjectId;
  brand: Types.ObjectId | string;
  points: number;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  userRole: string;
  brandPoints: IBrandPoints[];   // 🔹 Add this
  brands: (Types.ObjectId | string)[];
}
// const createBankPremium = async (
//   userId: string,
//   data: Partial<IBankPremium>
// ): Promise<IBankPremium> => {
//   const newBankPremium = new BankPremium({
//     ...data,
//     enrolled_users: [],
//     brand: data.brand || null,
//     redemptions: []
//   });

//   return await newBankPremium.save();
// };


const createBankPremium = async (
  userId: string,
  data: Partial<IBankPremium>
): Promise<IBankPremium> => {
  // ✅ Prepare the new BankPremium object
  const newBankPremium = new BankPremium({
    title: data.title,
    description: data.description,
    points_required: data.points_required,
    start_date: data.start_date,
    end_date: data.end_date,
    image_url: data.image_url,
    active: data.active !== undefined ? data.active : true,
    enrolled_users: [],
    brand: data.brand || null,
    redemptions: [],
    qty: data.qty !== undefined ? data.qty : null,  // ✅ Optional qty
  });

  // ✅ Save and return the created document
  return await newBankPremium.save();
};


const getBankPremiumById = async (
  bankPremiumId: string
): Promise<IBankPremium> => {
  const bankPremium = await BankPremium.findById(bankPremiumId).populate('enrolled_users');
  if (!bankPremium) throw new Error('BankPremium not found');
  return bankPremium;
};

// const updateBankPremium = async (
//   bankPremiumId: string,
//   updates: Partial<IBankPremium>
// ): Promise<IBankPremium> => {
//   const existingBankPremium = await BankPremium.findById(bankPremiumId);
//   if (!existingBankPremium) throw new Error('BankPremium not found');

//   Object.keys(updates).forEach((key) => {
//     if (
//       key !== 'enrolled_users' &&
//       key !== 'redemptions' && // prevent overwriting redemptions manually
//       updates[key as keyof IBankPremium] !== undefined
//     ) {
//       existingBankPremium.set(key, updates[key as keyof IBankPremium]);
//     }
//   });

//   return await existingBankPremium.save();
// };





const updateBankPremium = async (
  bankPremiumId: string,
  updates: Partial<IBankPremium>
): Promise<IBankPremium> => {
  const existingBankPremium = await BankPremium.findById(bankPremiumId);
  if (!existingBankPremium) throw new Error("BankPremium not found");

  Object.keys(updates).forEach((key) => {
    // Skip fields that should not be manually updated
    if (key === "enrolled_users" || key === "redemptions") return;

    const value = updates[key as keyof IBankPremium];

    // ✅ Handle qty specifically
    if (key === "qty") {
      if (value === undefined) return; // ignore if not provided
      if (typeof value !== "number" || value < 0) {
        throw new Error("Quantity (qty) must be a non-negative number");
      }
      existingBankPremium.set("qty", value);
      return;
    }

    // ✅ Normal update for all other fields
    if (value !== undefined) {
      existingBankPremium.set(key, value);
    }
  });

  return await existingBankPremium.save();
};


const deleteBankPremium = async (
  bankPremiumId: string
): Promise<IBankPremium> => {
  const bankPremium = await BankPremium.findByIdAndDelete(bankPremiumId);
  if (!bankPremium) throw new Error('BankPremium not found');
  return bankPremium;
};

// export const getAllBankPremiums = async (): Promise<IBankPremium[]> => {
//   try {
//     return await BankPremium.find({ active: true }).populate('enrolled_users');
//   } catch (error) {
//     console.error('Error fetching BankPremiums from the database:', error);
//     throw new Error('Error fetching BankPremiums');
//   }
// };
export const getAllBankPremiums = async (): Promise<IBankPremium[]> => {
  try {
    return await BankPremium.find(
      { active: true }
    ).select(
      "_id title description points_required start_date end_date image_url active"
    );
  } catch (error) {
    console.error("Error fetching BankPremiums from the database:", error);
    throw new Error("Error fetching BankPremiums");
  }
};


/**
 * Redeem a BankPremium for a user.
 * @param userId - ID of the user redeeming the premium.
 * @param premiumId - ID of the premium to redeem.
 * @returns user info + premium info + unique code
 */
// export const redeemBankPremiumService = async (
//   userId: string,
//   premiumId: string
// ): Promise<any> => {
//   try {
//     // :small_blue_diamond: Fetch premium and populate brand
//     const bankPremium = await BankPremium.findById(premiumId)
//       .populate<{ brand: IBrand }>("brand")
//       .exec();
//     if (!bankPremium) throw new Error("BankPremium not found");
//     const pointsRequired: number = Number(bankPremium.points_required);
//     if (!pointsRequired || isNaN(pointsRequired)) {
//       throw new Error("Invalid points requirement for this premium");
//     }
//     // :small_blue_diamond: Fetch user
//     const user = (await User.findById(userId).exec()) as IUser | null;
//     if (!user) throw new Error("User not found");
//     if (!bankPremium.brand)
//       throw new Error("BankPremium brand not properly set");
//     const brandId = bankPremium.brand.toString();
//     // :white_check_mark: Use correct field (brandPoints) instead of points
//     const brandPointsEntries: IBrandPoints[] = (user.brandPoints || []).filter(
//       (entry: IBrandPoints) =>
//         entry.brand instanceof mongoose.Types.ObjectId
//           ? entry.brand.toString() === brandId
//           : (entry.brand as any)._id?.toString() === brandId
//     );
//     if (brandPointsEntries.length === 0) {
//       throw new Error("You need to earn more points to redeem.");
//     }
//     // :small_blue_diamond: Sum all points
//     const totalPoints = brandPointsEntries.reduce(
//       (sum, entry) => sum + entry.points,
//       0
//     );
//     if (totalPoints < pointsRequired) {
//       throw new Error(
//         "You need to collect more points to redeem."
//       );
//     }
//     // :small_blue_diamond: Deduct points across entries
//     let pointsToDeduct = pointsRequired;
//     for (const entry of brandPointsEntries) {
//       if (pointsToDeduct <= 0) break;
//       if (entry.points <= pointsToDeduct) {
//         pointsToDeduct -= entry.points;
//         entry.points = 0;
//       } else {
//         entry.points -= pointsToDeduct;
//         pointsToDeduct = 0;
//       }
//     }
//     await user.save();
//     // :small_blue_diamond: Ensure user is enrolled
//     if (
//       !bankPremium.enrolled_users.some(
//         (id) => id.toString() === user._id.toString()
//       )
//     ) {
//       bankPremium.enrolled_users.push(user._id);
//     }
//     // :small_blue_diamond: Generate unique redemption code
//     const code = uuidv4().split("-")[0].toUpperCase();
//     // :small_blue_diamond: Add redemption entry
//     bankPremium.redemptions.push({
//       user: user._id,
//       code,
//       status: "pending",
//       redeemedAt: new Date(),
//     });
//     await bankPremium.save();
//     // :small_blue_diamond: Log user history
//     const userHistoryEntry = new UserHistory({
//       user_id: user._id,
//       date: new Date(),
//       description: `Redeemed bank premium: ${bankPremium.title}`,
//       points_used: pointsRequired.toString(),
//       type: "bank_premium_purchase",
//       reference_id: premiumId,
//       brand: brandId,
//       points_earned: 0,
//       qrCode: code,
//     });
//     await userHistoryEntry.save();
//       try {
//       await sendRedeemSuccessEmail(user.email, code, user.name);
//     } catch (emailError) {
//       console.error("⚠️ Failed to send redeem success email:", emailError);
//       // ❗ Don’t throw error here because redeem was successful, just log it
//     }

//     // :small_blue_diamond: Final Response
//     return {
//       user: {
//         userId: user._id,
//         username: user.name,
//         remaining_total_brand_points: totalPoints - pointsRequired,
//         brandId: brandId,
//         updatedPoints: (user.brandPoints || []).filter((p) =>
//           p.brand instanceof mongoose.Types.ObjectId
//             ? p.brand.toString() === brandId
//             : (p.brand as any)._id?.toString() === brandId
//         ),
//       },
//       bankPremium: {
//         title: bankPremium.title,
//         points_required: bankPremium.points_required,
//         enrolled_users: bankPremium.enrolled_users,
//         redemptions: bankPremium.redemptions,
//         brand: bankPremium.brand,
//       },
//       receipt: { code, status: "pending" },
//       userHistory: {
//         description: userHistoryEntry.description,
//         points_used: userHistoryEntry.points_used,
//         type: userHistoryEntry.type,
//       },
//     };
//   } catch (error: any) {
//     console.error("Error redeeming bank premium service:", error);
//     throw new Error(
//       error.message || "An error occurred during bank premium redemption"
//     );
//   }
// };


/**
 * Redeem a BankPremium for a user.
 * @param userId - ID of the user redeeming the premium.
 * @param premiumId - ID of the premium to redeem.
 * @returns user info + premium info + unique code
 */
export const redeemBankPremiumService = async (
  userId: string,
  premiumId: string
): Promise<any> => {
  try {
    // 🔹 Fetch premium and populate brand
    const bankPremium = await BankPremium.findById(premiumId)
      .populate<{ brand: IBrand }>("brand")
      .exec();
    if (!bankPremium) throw new Error("BankPremium not found");

    const pointsRequired: number = Number(bankPremium.points_required);
    if (!pointsRequired || isNaN(pointsRequired)) {
      throw new Error("Invalid points requirement for this premium");
    }

    // 🔹 Fetch user
    const user = (await User.findById(userId).exec()) as IUser | null;
    if (!user) throw new Error("User not found");
    if (!bankPremium.brand)
      throw new Error("BankPremium brand not properly set");

    const brandId = bankPremium.brand.toString();

    // 🔹 Check user's brand points
    const brandPointsEntries: IBrandPoints[] = (user.brandPoints || []).filter(
      (entry: IBrandPoints) =>
        entry.brand instanceof mongoose.Types.ObjectId
          ? entry.brand.toString() === brandId
          : (entry.brand as any)._id?.toString() === brandId
    );
    if (brandPointsEntries.length === 0) {
      throw new Error("You need to earn more points to redeem.");
    }

    // 🔹 Calculate total points
    const totalPoints = brandPointsEntries.reduce(
      (sum, entry) => sum + entry.points,
      0
    );  
    if (totalPoints < pointsRequired) {
      throw new Error("You need to collect more points to redeem.");
    }

    // 🔹 Check and update quantity if applicable
    if (typeof bankPremium.qty === "number") {
      if (bankPremium.qty <= 0) {
        throw new Error("This premium item is out of stock.");
      }

      bankPremium.qty -= 1; // ✅ Decrease available quantity

      // 🔹 If qty has reached zero after redemption → deactivate
      // if (bankPremium.qty === 0) {
      //   bankPremium.active = false;
      //   console.log(`⚠️ ${bankPremium.title} is now out of stock.`);
      // }
    }

    // 🔹 Deduct points
    let pointsToDeduct = pointsRequired;
    for (const entry of brandPointsEntries) {
      if (pointsToDeduct <= 0) break;
      if (entry.points <= pointsToDeduct) {
        pointsToDeduct -= entry.points;
        entry.points = 0;
      } else {
        entry.points -= pointsToDeduct;
        pointsToDeduct = 0;
      }
    }
    await user.save();

    // 🔹 Ensure user is enrolled
    if (
      !bankPremium.enrolled_users.some(
        (id) => id.toString() === user._id.toString()
      )
    ) {
      bankPremium.enrolled_users.push(user._id);
    }

    // 🔹 Generate unique redemption code
    const code = uuidv4().split("-")[0].toUpperCase();

    // 🔹 Add redemption entry
    bankPremium.redemptions.push({
      user: user._id,
      code,
      status: "pending",
      redeemedAt: new Date(),
    });

    await bankPremium.save();

    // 🔹 Log user history
    const userHistoryEntry = new UserHistory({
      user_id: user._id,
      date: new Date(),
      description: `Redeemed bank premium: ${bankPremium.title}`,
      points_used: pointsRequired.toString(),
      type: "bank_premium_purchase",
      reference_id: premiumId,
      brand: brandId,
      points_earned: 0,
      qrCode: code,
    });
    await userHistoryEntry.save();

    // 🔹 Attempt email
    try {
      await sendRedeemSuccessEmail(user.email, code, user.name);
    } catch (emailError) {
      console.error("⚠️ Failed to send redeem success email:", emailError);
    }

    // 🔹 Final Response
    return {
      user: {
        userId: user._id,
        username: user.name,
        remaining_total_brand_points: totalPoints - pointsRequired,
        brandId: brandId,
        updatedPoints: (user.brandPoints || []).filter((p) =>
          p.brand instanceof mongoose.Types.ObjectId
            ? p.brand.toString() === brandId
            : (p.brand as any)._id?.toString() === brandId
        ),
      },
      bankPremium: {
        title: bankPremium.title,
        qty: bankPremium.qty ?? null, // ✅ include qty in response
        points_required: bankPremium.points_required,
        enrolled_users: bankPremium.enrolled_users,
        redemptions: bankPremium.redemptions,
        brand: bankPremium.brand,
        active: bankPremium.active,
      },
      receipt: { code, status: "pending" },
      userHistory: {
        description: userHistoryEntry.description,
        points_used: userHistoryEntry.points_used,
        type: userHistoryEntry.type,
      },
    };
  } catch (error: any) {
    console.error("Error redeeming bank premium service:", error);
    throw new Error(
      error.message || "An error occurred during bank premium redemption"
    );
  }
};



/**
 * Verify redemption code (Admin use).
 */
export const verifyBankPremiumCodeService = async (code: string) => {
  const bankPremium = await BankPremium.findOne({ "redemptions.code": code });
  if (!bankPremium) throw new Error("Invalid code");

  const redemption = bankPremium.redemptions.find(r => r.code === code);
  if (!redemption) throw new Error("Invalid redemption code");

  if (redemption.status === "delivered") {
    throw new Error("Code already delivered");
  }

  redemption.status = "delivered";

  // Only set redeemedAt if not already set
  if (!redemption.redeemedAt) {
    redemption.redeemedAt = new Date();
  }

  await bankPremium.save();

  return {
    success: true,
    message: "Premium delivered successfully",
    data: {
      code: redemption.code,
      status: redemption.status,
      redeemedAt: redemption.redeemedAt,
      user: redemption.user,
    },
  };
};



export const   getAllRedemptionsService = async () => {
  const result = await BankPremium.aggregate([
    { $unwind: "$redemptions" },
    {
      $lookup: {
        from: "users", // 👈 must match your MongoDB collection name for users
        localField: "redemptions.user",
        foreignField: "_id",
        as: "userInfo"
      }
    },
    { $unwind: "$userInfo" }, // ensure userInfo is an object, not array
    {
      $project: {
        _id: 0,
        bankPremiumId: "$_id",
        title: 1,
        code: "$redemptions.code",
        status: "$redemptions.status",
        redeemedAt: "$redemptions.redeemedAt",
        user: {
          _id: "$userInfo._id",
          name: "$userInfo.name",
          email: "$userInfo.email",
          address: "$userInfo.address",
          parish: "$userInfo.parish"
        }
      }
    }
  ]);

  return result;
};



// new addition 
// export const getAllRedemptionsService = async () => {
//   const result = await BankPremium.aggregate([
//     { $unwind: "$redemptions" },
//     {
//       $lookup: {
//         from: "users",
//         localField: "redemptions.user",
//         foreignField: "_id",
//         as: "userInfo"
//       }
//     },
//     { $unwind: "$userInfo" },
//     {
//       $lookup: {
//         from: "bankpremia", // 👈 collection name (plural of BankPremium)
//         pipeline: [
//           { $unwind: "$redemptions" },
//           {
//             $group: {
//               _id: "$redemptions.user",
//               totalRedemptions: { $sum: 1 },
//               deliveredCount: {
//                 $sum: {
//                   $cond: [{ $eq: ["$redemptions.status", "delivered"] }, 1, 0]
//                 }
//               },
//               pendingCount: {
//                 $sum: {
//                   $cond: [{ $eq: ["$redemptions.status", "pending"] }, 1, 0]
//                 }
//               },
//               redeemedTitles: { $addToSet: "$title" }
//             }
//           }
//         ],
//         as: "userStats"
//       }
//     },
//     {
//       $unwind: {
//         path: "$userStats",
//         preserveNullAndEmptyArrays: true
//       }
//     },
//     {
//       $project: {
//         _id: 0,
//         bankPremiumId: "$_id",
//         title: 1,
//         code: "$redemptions.code",
//         status: "$redemptions.status",
//         redeemedAt: "$redemptions.redeemedAt",
//         user: {
//           _id: "$userInfo._id",
//           name: "$userInfo.name",
//           email: "$userInfo.email",
//           address: "$userInfo.address",
//           parish: "$userInfo.parish"
//         },
//         stats: {
//           totalRedemptions: "$userStats.totalRedemptions",
//           deliveredCount: "$userStats.deliveredCount",
//           pendingCount: "$userStats.pendingCount",
//           redeemedTitles: "$userStats.redeemedTitles"
//         }
//       }
//     }
//   ]);

//   return result;
// };

export const exportRedemptionsCSVService = async () => {
  // Get all redemption data
  const data = await getAllRedemptionsService();

  // Define CSV columns
  const fields = [
    "bankPremiumId",
    "title",
    "code",
    "status",
    "redeemedAt",
    "user.name",
    "user.email",
    "user.address",
    "user.parish",
    // "stats.totalRedemptions",
    // "stats.deliveredCount",
    // "stats.pendingCount",
    // "stats.redeemedTitles"
  ];

  // Convert to CSV
  const parser = new Parser({ fields });
  const csv = parser.parse(data);

  return csv;
};


export default {
  createBankPremium,
  updateBankPremium,
  deleteBankPremium,
  getBankPremiumById,
  getAllBankPremiums,
  redeemBankPremiumService,
  verifyBankPremiumCodeService,
  getAllRedemptionsService
};
