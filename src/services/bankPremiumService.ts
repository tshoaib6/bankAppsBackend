import BankPremium, { IBankPremium } from '../models/bankPremium.model';
import User from '../models/user.model';
import UserHistory from '../models/userHistory.model';
import { IBrand } from '../models/brand.model';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Document, Types } from "mongoose";

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
  points: IBrandPoints[];   // 🔹 Add this
  brands: (Types.ObjectId | string)[];
}
const createBankPremium = async (
  userId: string,
  data: Partial<IBankPremium>
): Promise<IBankPremium> => {
  const newBankPremium = new BankPremium({
    ...data,
    enrolled_users: [],
    brand: data.brand || null,
    redemptions: []
  });

  return await newBankPremium.save();
};

const getBankPremiumById = async (
  bankPremiumId: string
): Promise<IBankPremium> => {
  const bankPremium = await BankPremium.findById(bankPremiumId).populate('enrolled_users');
  if (!bankPremium) throw new Error('BankPremium not found');
  return bankPremium;
};

const updateBankPremium = async (
  bankPremiumId: string,
  updates: Partial<IBankPremium>
): Promise<IBankPremium> => {
  const existingBankPremium = await BankPremium.findById(bankPremiumId);
  if (!existingBankPremium) throw new Error('BankPremium not found');

  Object.keys(updates).forEach((key) => {
    if (
      key !== 'enrolled_users' &&
      key !== 'redemptions' && // prevent overwriting redemptions manually
      updates[key as keyof IBankPremium] !== undefined
    ) {
      existingBankPremium.set(key, updates[key as keyof IBankPremium]);
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

export const getAllBankPremiums = async (): Promise<IBankPremium[]> => {
  try {
    return await BankPremium.find().populate('enrolled_users');
  } catch (error) {
    console.error('Error fetching BankPremiums from the database:', error);
    throw new Error('Error fetching BankPremiums');
  }
};

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
    const user = await User.findById(userId).exec() as IUser | null;
    if (!user) throw new Error("User not found");

    if (!bankPremium.brand) throw new Error("BankPremium brand not properly set");

    const brandId = bankPremium.brand.toString();

    // 🔹 Collect all points for this brand
    const brandPointsEntries: IBrandPoints[] = user.points.filter(
      (entry) => entry.brand.toString() === brandId
    );

    if (brandPointsEntries.length === 0) {
      throw new Error("No points available for this brand");
    }

    // 🔹 Sum all points
    const totalPoints = brandPointsEntries.reduce(
      (sum, entry) => sum + entry.points,
      0
    );

    if (totalPoints < pointsRequired) {
      throw new Error("Insufficient total points in this brand to redeem the premium");
    }

    // 🔹 Deduct points across entries
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
    if (!bankPremium.enrolled_users.some(id => id.toString() === user._id.toString())) {
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

    // 🔹 Final Response
    return {
      user: {
        userId: user._id,
        username: user.name,
        remaining_total_brand_points: totalPoints - pointsRequired,
        brandId: brandId,
        updatedPoints: user.points.filter(p => p.brand.toString() === brandId),
      },
      bankPremium: {
        title: bankPremium.title,
        points_required: bankPremium.points_required,
        enrolled_users: bankPremium.enrolled_users,
        redemptions: bankPremium.redemptions,
        brand: bankPremium.brand,
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
    throw new Error(error.message || "An error occurred during bank premium redemption");
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



export const getAllRedemptionsService = async () => {
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
