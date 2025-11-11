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
  sort?: any;
  search?: string;
  filter?: Record<string, any>;
}
interface GetLeaderboardOptions {
  page?: number;
  limit?: number;
  sort?: Record<string, 1 | -1>;
  filter?: Record<string, any>;
  search?: string;

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
const escapeRegExp = (text: string): string =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// ✅ Get all Additional Items
const getAllAdditionalItems = async (
  options: GetAllAdditionalItemsOptions
): Promise<any> => {
  const { page = 1, limit = 10, sort = { createdAt: -1 }, search, filter = {} } = options;

  // ✅ Build optimized search filter
  const query: any = {
    ...filter,
    status: "active", // ✅ Only get items with active status
  };

  if (search && search.trim() !== "") {
    // Escape special regex characters
    const safeSearch = escapeRegExp(search.trim());

    // Use regex only on indexed or commonly searched fields
    query.$or = [
      { itemName: { $regex: safeSearch, $options: "i" } },
      { description: { $regex: safeSearch, $options: "i" } },
      { "brand.brandName": { $regex: safeSearch, $options: "i" } },
    ];
  }

  // ✅ Fetch paginated data
  const result = await paginate(AdditionalItem, {
    page,
    limit,
    sort,
    filter: query,
    populate: [
      {
        path: "brand",
        select: "_id brandName", // Only what is needed
      } as any,
    ],
  });

  // ✅ Remove sensitive fields
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
    .select("-enrolled_users -redemptions") // exclude unwanted fields
    .populate("brand", "brandName _id"); // ✅ only include brandName and _id

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

export const updateAdditionalItemStatus = async (
  itemId: string,
  newStatus: boolean
): Promise<IAdditionalItem | null> => {
  const updatedItem = await AdditionalItem.findByIdAndUpdate(
    itemId,
    { active: newStatus },
    { new: true }
  );

  return updatedItem;
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
    // Step 1: Fetch the item and populate brand
    const item = await AdditionalItem.findById(itemId)
      .populate('brand', 'brandName description logo isActive')
      .exec();

    if (!item) throw new Error('Item not found');

    // Step 2: Check qty (stock availability)
    const currentQty = item.qty ?? 0;
    if (currentQty <= 0) throw new Error('This item is out of stock.');

    // Step 3: Validate points requirement
    const pointsRequired = parseInt(item.points_required, 10);
    if (isNaN(pointsRequired)) throw new Error('Invalid points requirement for this item');

    // Step 4: Fetch user
    const user = await User.findById(userId).exec();
    if (!user) throw new Error('User not found');

    // Step 5: Ensure brand reference
    let brandId: string;
    if (item.brand) {
      brandId =
        typeof item.brand === 'object' && '_id' in item.brand
          ? (item.brand as any)._id.toString()
          : (item.brand as any).toString();
    } else {
      throw new Error('Item brand not properly populated or missing');
    }

    // Step 6: Find user's brand points entry
    const brandPointsEntry = user.brandPoints.find(
      (entry) =>
        entry.brand.toString() === brandId ||
        (entry.brand?._id && entry.brand._id.toString() === brandId)
    );

    if (!brandPointsEntry) throw new Error('Brand points entry not found for this brand.');
    if (brandPointsEntry.points < pointsRequired)
      throw new Error('You need to collect more points to redeem this item.');

    // Step 7: Deduct points and save user
    brandPointsEntry.points -= pointsRequired;
    user.markModified('brandPoints');
    await user.save();

    // Step 8: Deduct item qty
    item.qty = Math.max(0, currentQty - 1);

    const now = new Date();
    const redemptionCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    // Step 9: Handle redemption logic (with count tracking)
    const existingRedemption = item.redemptions.find(
      (r: any) => r.user?.toString() === user._id.toString()
    );

    if (existingRedemption) {
      existingRedemption.count = (existingRedemption.count || 1) + 1;
      existingRedemption.redeemedAt = now;
      existingRedemption.status = 'pending';
      existingRedemption.code = redemptionCode;
    } else {
      item.redemptions.push({
        user: user._id,
        code: redemptionCode,
        status: 'pending',
        redeemedAt: now,
        count: 1,
      } as any);
    }

    await item.save();

    // Step 10: Add to user history
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

    // Step 11: Return formatted response
    const userRedemption =
      item.redemptions.find((r: any) => r.user.toString() === user._id.toString()) ?? null;

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
          remaining_qty: item.qty,
          redemption_code: redemptionCode,
          redeemed_count: userRedemption?.count || 1,
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
    search,
  } = options;

  const escapeRegExp = (text: string) =>
    text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const searchFilter =
    search && search.trim()
      ? {
          $or: [
            { title: { $regex: escapeRegExp(search.trim()), $options: "i" } },
            { description: { $regex: escapeRegExp(search.trim()), $options: "i" } },
            { "brand.brandName": { $regex: escapeRegExp(search.trim()), $options: "i" } },
          ],
        }
      : {};

  const combinedFilter = { ...filter, ...searchFilter };

  const result = await paginate(AdditionalItem as Model<IAdditionalItem>, {
    page,
    limit,
    sort,
    filter: combinedFilter,
    populate: [
      {
        path: "brand",
        select: "_id brandName",
      } as any,
    ],
  });

  const dataWithLeaderboard = await Promise.all(
    result.data.map(async (item) => {
      const itemId =
        typeof item._id === "string"
          ? new Types.ObjectId(item._id)
          : (item._id as Types.ObjectId);

      const redemptions = await AdditionalItem.aggregate([
        { $match: { _id: itemId } },
        { $unwind: "$redemptions" },
        {
          $group: {
            _id: "$redemptions.user",
            userRedeemCount: {
              $sum: { $ifNull: ["$redemptions.count", 1] }, // ✅ Use count field
            },
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
            userRedeemCount: 1,
            lastRedeemedAt: 1,
          },
        },
        { $sort: { userRedeemCount: -1 } },
      ]);

      const totalItemRedeems = redemptions.reduce(
        (sum, r) => sum + (r.userRedeemCount || 0),
        0
      );

      const itemObj = item.toObject ? item.toObject() : item;
      delete itemObj.enrolled_users;
      delete itemObj.redemptions;
      delete itemObj.qty;

      return {
        ...itemObj,
        totalItemRedeems,
        leaderboard: redemptions,
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
