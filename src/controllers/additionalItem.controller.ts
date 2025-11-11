import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import {
  createAdditionalItem,
  getAllAdditionalItems,
  getAdditionalItemById,
  updateAdditionalItem,
  deleteAdditionalItem,
  redeemAdditionalItemService,
  getAdditionalItemsWithLeaderboard,
  updateAdditionalItemStatus,
} from "../services/additionalItem.service";
import { uploadToCloudinary } from "../utils/cloudinary";

// ✅ Create a new Additional Item
export const createAdditionalItemController = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authorization token required",
      });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.userId;

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Image is required" });
    }

    const imageUrl = await uploadToCloudinary(req.file.buffer, "additional_items");

    const {
      title,
      description,
      points_required,
      start_date,
      end_date,
      active,
      qty,
      brand,
    } = req.body;

    const newItemData = {
      title,
      description,
      points_required,
      start_date,
      end_date,
      image_url: imageUrl,
      active: active !== undefined ? active : true,
      qty: qty !== undefined ? Number(qty) : undefined,
      brand: brand || null,
    };

    const newItem = await createAdditionalItem(userId, newItemData);

    // ✅ Exclude both `enrolled_users` and `redemptions` from response
    const { enrolled_users, redemptions, ...filteredItem } = newItem.toObject();

    res.status(201).json({
      success: true,
      message: "Additional item created successfully",
      data: filteredItem, // 👈 cleaned response
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "An error occurred while creating additional item",
      error: error.message,
    });
  }
};



// ✅ Get all Additional Items
export const getAllAdditionalItemsController = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { page, limit, sortBy, sortOrder, search, ...filters } = req.query;

    // ✅ Decode token to get user role
    const token = req.header("Authorization")?.replace("Bearer ", "");
    let userRole = "user"; // default
    if (token) {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      userRole = decoded.userRole || "user";
    }

    const sort: Record<string, 1 | -1> =
      typeof sortBy === "string"
        ? { [sortBy]: sortOrder === "asc" ? 1 : -1 }
        : { createdAt: -1 };

    const options = {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      sort,
      search: typeof search === "string" ? search : undefined,
      filter: filters,
      showAll: userRole === "admin", // ✅ admin sees all, user sees only active
    };

    const result = await getAllAdditionalItems(options);

    return res.status(200).json({
      success: true,
      message: "Additional items fetched successfully",
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching additional items",
    });
  }
};




// ✅ Get an Additional Item by ID
export const getAdditionalItemByIdController = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { itemId } = req.params;
    const item = await getAdditionalItemById(itemId);
    if (!item)
      return res
        .status(404)
        .json({ success: false, message: "Additional item not found" });

    res.status(200).json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch additional item",
      error: error.message,
    });
  }
};

// ✅ Update an Additional Item
export const updateAdditionalItemController = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { itemId } = req.params;
    const updates = { ...req.body };

    // ✅ Upload new image if provided
    if (req.file) {
      const imageUrl = await uploadToCloudinary(req.file.buffer, "additional_items");
      updates.image_url = imageUrl;
    }

    const updatedItem = await updateAdditionalItem(itemId, updates);

    if (!updatedItem) {
      return res.status(404).json({
        success: false,
        message: "Additional item not found",
      });
    }

    // ✅ Exclude unwanted fields from response
    const {
      enrolled_users,
      redemptions,
      createdAt,
      updatedAt,

      ...filteredItem
    } = updatedItem.toObject();

    // ✅ Send filtered response
    res.status(200).json({
      success: true,
      message: "Additional item updated successfully",
      data: filteredItem,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to update additional item",
      error: error.message,
    });
  }
};



// ✅ Delete an Additional Item
export const deleteAdditionalItemController = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { itemId } = req.params;

    const deletedItem = await deleteAdditionalItem(itemId);

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: "Additional item not found",
      });
    }

    // ✅ Keep only minimal and useful fields in response
    const {
      _id,
      title,
      brand,
      qty,
      points_required,
      active
    } = deletedItem.toObject();

    // ✅ Respond with trimmed data
    res.status(200).json({
      success: true,
      message: "Additional item deleted successfully",
      data: {
        _id,
        title,
        brand,
        qty,
        points_required,
        active
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to delete additional item",
      error: error.message,
    });
  }
};

export const updateAdditionalItemStatusController = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { itemId } = req.params;
    const { active } = req.body; // boolean: true or false

    if (active === undefined) {
      return res.status(400).json({
        success: false,
        message: "Active status is required (true or false)",
      });
    }

    const updatedItem = await updateAdditionalItemStatus(itemId, active);

    if (!updatedItem) {
      return res.status(404).json({
        success: false,
        message: "Additional item not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Item status updated successfully`,
      data: updatedItem,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to update item status",
      error: error.message,
    });
  }
};


export const redeemAdditionalItem = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { itemId } = req.params;

    // ✅ Check token presence
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing or invalid format",
      });
    }

    const token = authHeader.replace("Bearer ", "");

    // ✅ Verify token safely
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired authorization token",
      });
    }

    const userId = decoded.userId;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Invalid token payload: userId missing",
      });
    }

    // ✅ Perform service call
    const result = await redeemAdditionalItemService(userId, itemId);

    // ✅ Return response from service directly
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while redeeming additional item",
    });
  }
};

export const getAdditionalItemsLeaderboard = async (
  req: Request,
  res: Response
) => {
  try {
    const { page, limit, sortBy, sortOrder, search } = req.query;

    // ✅ Handle sorting logic
    const sort: Record<string, 1 | -1> =
      typeof sortBy === "string"
        ? { [sortBy]: sortOrder === "asc" ? 1 : -1 }
        : { createdAt: -1 };

    // ✅ Prepare options for service function
    const options = {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      sort,
      search: typeof search === "string" ? search : undefined,
    };

    // ✅ Call service with options
    const result = await getAdditionalItemsWithLeaderboard(options);

    // ✅ Return structured response
    return res.status(200).json({
      success: true,
      message: "Leaderboard data fetched successfully",
      ...result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Server error while fetching leaderboard data",
    });
  }
};
