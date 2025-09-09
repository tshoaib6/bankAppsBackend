import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import StoreService from "../services/storeService";
import path from "path";

// ✅ Create store
export const createStore = async (req: Request, res: Response): Promise<any> => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Authorization token required" });
    }

    jwt.verify(token, process.env.JWT_SECRET!); // token check only, no createdBy in model

    const {
      customerNumber,
      customerName,
      address,
      parish,
      telephoneNumber,
      latitude,
      longitude,
      isActive,
    } = req.body;

    if (!customerNumber || !customerName || !address || !parish || !telephoneNumber || !latitude || !longitude) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const storeData = {
      customerNumber,
      customerName,
      address,
      parish,
      telephoneNumber,
      location: { latitude, longitude },
      ...(typeof isActive !== "undefined" && { isActive }),
    };

    const newStore = await StoreService.createStore(storeData);

    return res.status(201).json({
      store: newStore,
      message: "Store created successfully",
    });
  } catch (error) {
    console.error("Error creating store:", error);
    return res.status(500).json({ message: "Server error while creating store" });
  }
};

// ✅ Get all stores (with pagination)
// export const getStores = async (req: Request, res: Response): Promise<any> => {
//   try {
//     const page = parseInt(req.query.page as string) || 1;
//     const limit = parseInt(req.query.limit as string) || 20;

//     const { stores, totalCount, totalPages, currentPage } = await StoreService.getStores(page, limit);

//     return res.status(200).json({
//       stores,
//       totalCount,
//       totalPages,
//       currentPage,
//       message: "Stores fetched successfully",
//     });
//   } catch (error) {
//     console.error("Error fetching stores:", error);
//     return res.status(500).json({
//       message: "Server error while fetching stores",
//       error: error instanceof Error ? error.message : "Unknown error",
//     });
//   }
// };

export const getStores = async (req: Request, res: Response): Promise<any> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || ""; // ✅ get search term

    const { stores, totalCount, totalPages, currentPage } = await StoreService.getStores(
      page,
      limit,
      search // ✅ pass search to service
    );

    return res.status(200).json({
      stores,
      totalCount,
      totalPages,
      currentPage,
      message: "Stores fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching stores:", error);
    return res.status(500).json({
      message: "Server error while fetching stores",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};



// ✅ Get single store by ID
export const getStoreById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { storeId } = req.params;

    const store = await StoreService.getStoreById(storeId);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    return res.status(200).json({ store, message: "Store fetched successfully" });
  } catch (error) {
    console.error("Error fetching store:", error);
    return res.status(500).json({ message: "Server error while fetching store" });
  }
};

// ✅ Update store
export const updateStore = async (req: Request, res: Response): Promise<any> => {
  try {
    const { storeId } = req.params;
    const updates = req.body;

    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Authorization token required" });
    }

    jwt.verify(token, process.env.JWT_SECRET!);

    const updatedStore = await StoreService.updateStore(storeId, updates);
    if (!updatedStore) {
      return res.status(404).json({ message: "Store not found or update failed" });
    }

    return res.status(200).json({
      store: updatedStore,
      message: "Store updated successfully",
    });
  } catch (error) {
    console.error("Error updating store:", error);
    return res.status(500).json({ message: "Server error while updating store" });
  }
};

// ✅ Delete store
export const deleteStore = async (req: Request, res: Response): Promise<any> => {
  try {
    const { storeId } = req.params;

    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Authorization token required" });
    }

    jwt.verify(token, process.env.JWT_SECRET!);

    const deletedStore = await StoreService.deleteStore(storeId);
    if (!deletedStore) {
      return res.status(404).json({ message: "Store not found or delete failed" });
    }

    return res.status(200).json({ message: "Store deleted successfully" });
  } catch (error) {
    console.error("Error deleting store:", error);
    return res.status(500).json({ message: "Server error while deleting store" });
  }
};

export const uploadStores = async (req: Request, res: Response) => {
  try {
    // File uploaded via multer middleware
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = path.resolve(req.file.path);

    const stores = await StoreService.importStoresFromCSV(filePath);

    res.status(201).json({
      message: "Stores imported successfully",
      count: stores.length,
      data: stores,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Error importing stores",
      error: error.message,
    });
  }
};