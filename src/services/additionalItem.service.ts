import AdditionalItem, { IAdditionalItem } from "../models/additionalItems.model";
import mongoose, { Document, Types } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { Parser } from "json2csv";
import { sendRedeemSuccessEmail } from "../utils/sendRedeemSuccessEmail";
import User from "../models/user.model";
import UserHistory from "../models/userHistory.model";
import { IBrand } from "../models/brand.model";

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
  brandPoints: IBrandPoints[];
  brands: (Types.ObjectId | string)[];
}

// ✅ Create a new Additional Item
const createAdditionalItem = async (
  userId: string,
  data: Partial<IAdditionalItem>
): Promise<IAdditionalItem> => {
  const newAdditionalItem = new AdditionalItem({
    title: data.title,
    description: data.description,
    points_required: Number(data.points_required),
    start_date: data.start_date ? new Date(data.start_date) : undefined,
    end_date: data.end_date ? new Date(data.end_date) : undefined,
    image_url: data.image_url,
    active: data.active !== undefined ? data.active : true,
    enrolled_users: [],
    brand: data.brand || null,
    redemptions: [],
    qty: data.qty !== undefined ? Number(data.qty) : null,
    createdBy: userId,
  });

  return await newAdditionalItem.save();
};

// ✅ Get all Additional Items
const getAllAdditionalItems = async (): Promise<IAdditionalItem[]> => {
  return await AdditionalItem.find().populate("brand enrolled_users");
};

// ✅ Get an Additional Item by ID
const getAdditionalItemById = async (
  itemId: string
): Promise<IAdditionalItem> => {
  const additionalItem = await AdditionalItem.findById(itemId).populate("enrolled_users");
  if (!additionalItem) throw new Error("Additional item not found");
  return additionalItem;
};

// ✅ Update an Additional Item
const updateAdditionalItem = async (
  itemId: string,
  updates: Partial<IAdditionalItem>
): Promise<IAdditionalItem> => {
  const existingItem = await AdditionalItem.findById(itemId);
  if (!existingItem) throw new Error("Additional item not found");

  Object.keys(updates).forEach((key) => {
    if (key === "enrolled_users" || key === "redemptions") return;

    const value = updates[key as keyof IAdditionalItem];

    if (key === "qty") {
      if (value === undefined) return;
      if (typeof value !== "number" || value < 0) {
        throw new Error("Quantity (qty) must be a non-negative number");
      }
      existingItem.set("qty", value);
      return;
    }

    if (value !== undefined) {
      existingItem.set(key, value);
    }
  });

  return await existingItem.save();
};

// ✅ Delete an Additional Item
const deleteAdditionalItem = async (
  itemId: string
): Promise<IAdditionalItem> => {
  const deletedItem = await AdditionalItem.findByIdAndDelete(itemId);
  if (!deletedItem) throw new Error("Additional item not found");
  return deletedItem;
};



/**
 * Redeem an additional item for a user.
 * @param userId - ID of the user redeeming the item.
 * @param itemId - ID of the additional item to redeem.
 * @returns Updated user data and item details including brand info.
 * @throws Error if item or user not found or points insufficient.
 */
export const redeemAdditionalItemService = async (userId: string, itemId: string) => {
  try {
    const item = await AdditionalItem.findById(itemId)
      .populate<{ brand: IBrand }>('brand')
      .exec();

    if (!item) {
      throw new Error('Item not found');
    }

    const pointsRequired = parseInt(item.points_required, 10);
    if (isNaN(pointsRequired)) {
      throw new Error('Invalid points requirement for the item');
    }

    const user = await User.findById(userId).exec();
    if (!user) {
      throw new Error('User not found');
    }

    if (!item.brand || !item.brand._id) {
      throw new Error('Item brand not properly populated');
    }

    const brandId = item.brand._id.toString();

    // 🔍 Find user's points for that brand
    const brandPointsEntry = user.brandPoints.find(
      (entry) => entry.brand.toString() === brandId
    );

    if (!brandPointsEntry || brandPointsEntry.points < pointsRequired) {
      throw new Error('You need to collect more points to redeem this item.');
    }

    // 💰 Deduct brand points
    brandPointsEntry.points -= pointsRequired;
    await user.save();

    // ✅ Update redemptions (type-safe, without changing schema)
    const redemption = item.redemptions.find(
      (r: any) => r.user.toString() === user._id.toString()
    );

    const now = new Date();

    if (redemption) {
      // If the model doesn’t have `count` or `lastRedeemedAt`, store locally only
      (redemption as any).count = ((redemption as any).count || 0) + 1;
      (redemption as any).redeemedAt = now; // Use existing field from schema
    } else {
      // Add a new redemption entry safely using existing schema fields
      item.redemptions.push({
        user: user._id,
        redeemedAt: now,
      } as any);
    }

    await item.save();

    // 🧾 Log user history
    const userHistoryEntry = new UserHistory({
      user_id: user._id,
      date: new Date(),
      description: `Redeemed additional item: ${item.title}`,
      points_used: pointsRequired.toString(),
      type: 'additional_item_purchase',
      reference_id: itemId,
      brand: item.brand._id,
      points_earned: 0,
      qrCode: null,
    });

    await userHistoryEntry.save();

    // ✅ Return formatted response
    return {
      user: {
        userId: user._id,
        username: user.name,
        remaining_brand_points: brandPointsEntry.points,
        brandId: item.brand._id,
      },
      additionalItem: {
        title: item.title,
        points_required: item.points_required,
        redemptions: item.redemptions.map((r: any) => ({
          user: r.user,
          redeemedAt: r.redeemedAt,
          count: (r.count || 1), // optional: safe fallback
        })),
        brand: {
          _id: item.brand._id,
          brandName: item.brand.brandName,
          description: item.brand.description,
          logo: item.brand.logo,
          isActive: item.brand.isActive,
        },
      },
      userHistory: {
        description: userHistoryEntry.description,
        points_used: userHistoryEntry.points_used,
        type: userHistoryEntry.type,
      },
    };
  } catch (error: any) {
    console.error('Error redeeming additional item:', error);
    throw new Error(error.message || 'An error occurred during item redemption');
  }
};


export const getAdditionalItemsWithLeaderboard = async () => {
  const items = await AdditionalItem.find().populate("brand").lean();

  const itemData = await Promise.all(
    items.map(async (item) => {
      // Aggregate redemptions for this additional item
      const redemptions = await AdditionalItem.aggregate([
        { $match: { _id: item._id } },
        { $unwind: "$redemptions" },
        {
          $group: {
            _id: "$redemptions.user",
            totalRedeems: { $sum: 1 }, // since each redemption is one record
            lastRedeemedAt: { $max: "$redemptions.redeemedAt" }, // existing field
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

      // Calculate total item redemptions (sum of all users’ redeems)
      const totalItemRedeems = redemptions.reduce(
        (sum, r) => sum + (r.totalRedeems || 0),
        0
      );

      return {
        ...item,
        leaderboard: redemptions,
        totalItemRedeems,
      };
    })
  );

  return itemData;
};
export {
  createAdditionalItem,
  getAllAdditionalItems,
  getAdditionalItemById,
  updateAdditionalItem,
  deleteAdditionalItem,
  
};
