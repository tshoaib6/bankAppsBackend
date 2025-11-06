import AdditionalItem, { IAdditionalItem } from "../models/additionalItems.model";
import mongoose, { Document, Types } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { Parser } from "json2csv";
import { sendRedeemSuccessEmail } from "../utils/sendRedeemSuccessEmail";
import User from "../models/user.model";
import UserHistory from "../models/userHistory.model";
import Brand, { IBrand } from "../models/brand.model";
import { paginate } from "../utils/pagination";
import { Model } from "mongoose";

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
interface GetAllAdditionalItemsOptions {
  page?: number;
  limit?: number;
  sort?: Record<string, 1 | -1>;
  filter?: Record<string, any>;
}
interface GetLeaderboardOptions {
  page?: number;
  limit?: number;
  sort?: Record<string, 1 | -1>;
  filter?: Record<string, any>;
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
 const getAllAdditionalItems = async (
  options: GetAllAdditionalItemsOptions
): Promise<any> => {
  const { page = 1, limit = 10, sort = { createdAt: -1 }, filter = {} } = options;

  const result = await paginate(AdditionalItem, {
    page,
    limit,
    sort,
    filter,
    populate: [
      {
        path: "brand",
        select: "_id brandName", // only keep _id and brandName
      } as any,
    ],
  });

  // Remove sensitive fields like enrolled_users, redemptions
  const cleanedData = result.data.map((item) => {
    const obj = item.toObject();
    delete obj.enrolled_users;
    delete obj.redemptions;
    return obj;
  });

  return {
    ...result,
    data: cleanedData,
  };
};


// ✅ Get an Additional Item by ID
const getAdditionalItemById = async (
  itemId: string
): Promise<IAdditionalItem> => {
  const additionalItem = await AdditionalItem.findById(itemId)
    .select("-enrolled_users -redemptions") // ❌ exclude fields
    .populate("brand"); // ✅ only populate brand

  if (!additionalItem) throw new Error("Additional item not found");
  
  return additionalItem;
};

// ✅ Update an Additional Item
const updateAdditionalItem = async (
  itemId: string,
  updates: Partial<IAdditionalItem>
): Promise<IAdditionalItem> => {
  // Find existing item
  const existingItem = await AdditionalItem.findById(itemId);
  if (!existingItem) throw new Error("Additional item not found");

  // Loop through update keys
  Object.keys(updates).forEach((key) => {
    // Skip these protected fields
    if (key === "enrolled_users" || key === "redemptions") return;

    let value = updates[key as keyof IAdditionalItem];

    // ✅ Handle numeric conversions safely
    if (key === "qty" && value !== undefined) {
      const parsedQty = Number(value);
      if (isNaN(parsedQty) || parsedQty < 0) {
        throw new Error("Quantity (qty) must be a non-negative number");
      }
      existingItem.set("qty", parsedQty);
      return;
    }

    if (key === "points_required" && value !== undefined) {
      const parsedPoints = Number(value);
      if (isNaN(parsedPoints) || parsedPoints < 0) {
        throw new Error("Points required must be a non-negative number");
      }
      existingItem.set("points_required", parsedPoints);
      return;
    }

    // ✅ Set other fields normally
    if (value !== undefined) {
      existingItem.set(key, value);
    }
  });

  // ✅ Save updated document
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
    // 🔹 Step 1: Fetch the additional item and try to populate brand
    const item = await AdditionalItem.findById(itemId)
      .populate('brand', 'brandName description logo isActive')
      .exec();

    if (!item) throw new Error('Item not found');

    // 🔹 Step 2: Validate points
    const pointsRequired = parseInt(item.points_required, 10);
    if (isNaN(pointsRequired)) throw new Error('Invalid points requirement for the item');

    // 🔹 Step 3: Get the user
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

    // ✅ Define a proper type for brandPoints entries
    const brandPointsArray = user.brandPoints as Array<{ brand: any; points: number }>;

    // 🔹 Step 5: Check user’s brand points
    const brandPointsEntry = brandPointsArray.find(
      (entry) => entry.brand?.toString() === brandId
    );

    if (!brandPointsEntry || brandPointsEntry.points < pointsRequired) {
      throw new Error('You need to collect more points to redeem this item.');
    }

    // 🔹 Step 6: Deduct brand points
    brandPointsEntry.points -= pointsRequired;
    await user.save();

    // ✅ Also type redemptions array safely
    const redemptionsArray = item.redemptions as Array<{
      user: any;
      code: string;
      status: string;
      redeemedAt: Date;
    }>;

    // 🔹 Step 7: Handle redemption logic
    const existingRedemption = redemptionsArray.find(
      (r) => r.user?.toString() === user._id.toString()
    );

    const now = new Date();
    const redemptionCode = Math.random().toString(36).substring(2, 10).toUpperCase();

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

    // 🔹 Step 9: Build formatted response
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





export const getAdditionalItemsWithLeaderboard = async (
  options: GetLeaderboardOptions = {}
): Promise<any> => {
  const {
    page = 1,
    limit = 10,
    sort = { createdAt: -1 },
    filter = {},
  } = options;

  // ✅ Use your shared pagination utility
  const result = await paginate(AdditionalItem as Model<IAdditionalItem>, {
    page,
    limit,
    sort,
    filter,
    populate: [
  {
    path: "brand",
    select: "_id brandName",
  } as any,
],
  });

  // ✅ Compute leaderboard for each additional item
  const dataWithLeaderboard = await Promise.all(
    result.data.map(async (item) => {
      const redemptions = await AdditionalItem.aggregate([
        { $match: { _id: item._id } },
        { $unwind: "$redemptions" },
        {
          $group: {
            _id: "$redemptions.user",
            totalRedeems: { $sum: 1 },
            lastRedeemedAt: { $max: "$redemptions.redeemedAt" },
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

      const totalItemRedeems = redemptions.reduce(
        (sum, r) => sum + (r.totalRedeems || 0),
        0
      );

      const itemObj = item.toObject ? item.toObject() : item;
      delete itemObj.enrolled_users;
      delete itemObj.redemptions;

      return {
        ...itemObj,
        leaderboard: redemptions,
        totalItemRedeems,
      };
    })
  );

  return {
    ...result,
    data: dataWithLeaderboard,
  };
};
export {
  createAdditionalItem,
  getAllAdditionalItems,
  getAdditionalItemById,
  updateAdditionalItem,
  deleteAdditionalItem,
  
};
