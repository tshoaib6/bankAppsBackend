import BankPremium, { IBankPremium } from '../models/bankPremium.model';
import User from '../models/user.model';
import UserHistory from '../models/userHistory.model';
import { IBrand } from '../models/brand.model';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

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
export const redeemBankPremiumService = async (userId: string, premiumId: string): Promise<any> => {
  try {
    const bankPremium = await BankPremium.findById(premiumId)
      .populate<{ brand: IBrand }>('brand')
      .exec();

    if (!bankPremium) {
      throw new Error('BankPremium not found');
    }

    const pointsRequired = parseInt(bankPremium.points_required, 10);
    if (isNaN(pointsRequired)) {
      throw new Error('Invalid points requirement for this premium');
    }

    const user = await User.findById(userId).exec();
    if (!user) {
      throw new Error('User not found');
    }

    if (!bankPremium.brand) {
      throw new Error('BankPremium brand not properly set');
    }

    const brandId = bankPremium.brand.toString();

    // Find user's points for that brand
    const brandPointsEntry = user.brandPoints.find(entry =>
      entry.brand.toString() === brandId
    );

    if (!brandPointsEntry || brandPointsEntry.points < pointsRequired) {
      throw new Error('Insufficient points in this brand to redeem the premium');
    }

    // Deduct brand points
    brandPointsEntry.points -= pointsRequired;
    await user.save();

    // Ensure enrolled_users contains this user
    if (!bankPremium.enrolled_users.map(id => id.toString()).includes(user._id.toString())) {
      bankPremium.enrolled_users.push(user._id); // ✅ push ObjectId, not string
    }

    // Generate unique redemption code
    const code = uuidv4().split('-')[0].toUpperCase(); // Example: "A1B2C3D4"

    // Add redemption entry
    bankPremium.redemptions.push({
      user: user._id,
      code,
      status: 'pending',
      redeemedAt: new Date()
    });

    await bankPremium.save();

    // Log user history
    const userHistoryEntry = new UserHistory({
      user_id: user._id,
      date: new Date(),
      description: `Redeemed bank premium: ${bankPremium.title}`,
      points_used: pointsRequired.toString(),
      type: 'bank_premium_purchase',
      reference_id: premiumId,
      brand: brandId,
      points_earned: 0, // no points earned, only redeemed
      qrCode: code // store unique code here as well if you want
    });

    await userHistoryEntry.save();

    return {
      user: {
        userId: user._id,
        username: user.name,
        remaining_brand_points: brandPointsEntry.points,
        brandId: brandId,
      },
      bankPremium: {
        title: bankPremium.title,
        points_required: bankPremium.points_required,
        enrolled_users: bankPremium.enrolled_users,
        redemptions: bankPremium.redemptions,
        brand: bankPremium.brand
      },
      receipt: {
        code, // ✅ this code goes on the frontend receipt
        status: 'pending'
      },
      userHistory: {
        description: userHistoryEntry.description,
        points_used: userHistoryEntry.points_used,
        type: userHistoryEntry.type,
      }
    };
  } catch (error: any) {
    console.error('Error redeeming bank premium service:', error);
    throw new Error(error.message || 'An error occurred during bank premium redemption');
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
  redemption.redeemedAt = new Date(); // ✅ optional: update timestamp if needed
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
