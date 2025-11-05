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

export {
  createAdditionalItem,
  getAllAdditionalItems,
  getAdditionalItemById,
  updateAdditionalItem,
  deleteAdditionalItem,
};
