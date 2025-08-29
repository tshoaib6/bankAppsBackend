import Store, { IStore } from "../models/store.model";
import { paginate } from "../utils/pagination";
import { parse } from "csv-parse";
import fs from "fs";

// ✅ Create store
const createStore = async (storeData: Partial<IStore>): Promise<IStore> => {
  try {
    const store = new Store(storeData);
    return await store.save();
  } catch (error) {
    console.error("Error creating store:", error);
    throw new Error("Failed to create store. Please try again.");
  }
};

// ✅ Get stores (with pagination)
export const getStores = async (
  page: number,
  limit: number
): Promise<{
  stores: IStore[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}> => {
  try {
    const { data: stores, totalCount, totalPages, currentPage } =
      await paginate<IStore>(Store, {
        page,
        limit,
        sort: { createdAt: -1 },
      });

    return { stores, totalCount, totalPages, currentPage };
  } catch (error) {
    console.error("Error fetching stores:", error);
    throw new Error("Failed to fetch stores. Please try again.");
  }
};

// ✅ Get single store
const getStoreById = async (storeId: string): Promise<IStore | null> => {
  try {
    return await Store.findById(storeId);
  } catch (error: any) {
    console.error(`Error fetching store with ID ${storeId}:`, error);
    throw new Error(error.message || "Failed to fetch store. Please try again.");
  }
};

// ✅ Update store
const updateStore = async (
  storeId: string,
  updates: Partial<IStore>
): Promise<IStore | null> => {
  try {
    const updatedStore = await Store.findByIdAndUpdate(storeId, updates, {
      new: true,
    });
    if (!updatedStore) {
      throw new Error("Store not found or update failed.");
    }
    return updatedStore;
  } catch (error: any) {
    console.error(`Error updating store with ID ${storeId}:`, error);
    throw new Error(error.message || "Failed to update store. Please try again.");
  }
};

// ✅ Delete store
const deleteStore = async (storeId: string): Promise<IStore | null> => {
  try {
    const deletedStore = await Store.findByIdAndDelete(storeId);
    if (!deletedStore) {
      throw new Error("Store not found or delete failed.");
    }
    return deletedStore;
  } catch (error: any) {
    console.error(`Error deleting store with ID ${storeId}:`, error);
    throw new Error(error.message || "Failed to delete store. Please try again.");
  }
};

// ❌ Removed getStoresByBrandId because "brand" is not in your model
// If you want it, you must add `brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" }` to StoreSchema

// ✅ Import CSV
const importStoresFromCSV = async (filePath: string): Promise<IStore[]> => {
  return new Promise((resolve, reject) => {
    const stores: Partial<IStore>[] = [];

    fs.createReadStream(filePath)
      .pipe(parse({ columns: true, trim: true }))
      .on("data", (row: Record<string, string>) => {
        stores.push({
          customerNumber: row["Customer Number"],
          customerName: row["Customer Name"],
          address: row["Address"],
          parish: row["Parish"],
          telephoneNumber: row["Telephone Number"],
          location: {
            latitude: parseFloat(row["Latitude"]) || 0,
            longitude: parseFloat(row["Longitude"]) || 0,
          },
        });
      })
      .on("end", async () => {
        try {
          const result = await Store.insertMany(stores, { ordered: false });
          resolve(result);
        } catch (error) {
          reject(error);
        }
      })
      .on("error", (err: any) => reject(err));
  });
};

export default {
  createStore,
  getStores,
  getStoreById,
  updateStore,
  deleteStore,
  importStoresFromCSV,
};
