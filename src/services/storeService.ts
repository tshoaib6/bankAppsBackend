import Store, { IStore } from '../models/store.model'
import { paginate } from '../utils/pagination'

const createStore = async (storeData: Partial<IStore>): Promise<IStore> => {
  try {
    const store = new Store(storeData)
    return await store.save()
  } catch (error) {
    console.error('Error creating store:', error)
    throw new Error('Failed to create store. Please try again.')
  }
}

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
        sort: { createdAt: -1 }, // sort by newest first
      });

    return {
      stores,
      totalCount,
      totalPages,
      currentPage,
    };
  } catch (error) {
    console.error("Error fetching stores:", error);
    throw new Error("Failed to fetch stores. Please try again.");
  }
};

const getStoreById = async (storeId: string): Promise<IStore | null> => {
  try {
    const store = await Store.findById(storeId)
    if (!store) {
      throw new Error('Store not found')
    }
    return store
  } catch (error: any) {
    console.error(`Error fetching store with ID ${storeId}:`, error)
    throw new Error(error.message || 'Failed to fetch store. Please try again.')
  }
}

const updateStore = async (
  storeId: string,
  updates: Partial<IStore>
): Promise<IStore | null> => {
  try {
    const store = await Store.findById(storeId)
    if (!store) {
      throw new Error('Store not found')
    }

    // Support optional fields like `brand` and `isActive`
    const updatedStore = await Store.findByIdAndUpdate(storeId, updates, {
      new: true
    })
    if (!updatedStore) {
      throw new Error('Failed to update store. Please try again.')
    }

    return updatedStore
  } catch (error: any) {
    console.error(`Error updating store with ID ${storeId}:`, error)
    throw new Error(
      error.message || 'Failed to update store. Please try again.'
    )
  }
}

const deleteStore = async (storeId: string): Promise<IStore | null> => {
  try {
    const store = await Store.findById(storeId)
    if (!store) {
      throw new Error('Store not found')
    }

    const deletedStore = await Store.findByIdAndDelete(storeId)
    if (!deletedStore) {
      throw new Error('Failed to delete store. Please try again.')
    }

    return deletedStore
  } catch (error: any) {
    console.error(`Error deleting store with ID ${storeId}:`, error)
    throw new Error(
      error.message || 'Failed to delete store. Please try again.'
    )
  }
}
const getStoresByBrandId = async (brandId: string): Promise<IStore[]> => {
  try {
    return await Store.find({ brand: brandId });
  } catch (error: any) {
    console.error(`Error fetching stores for brand ID ${brandId}:`, error);
    throw new Error(error.message || 'Failed to fetch stores by brand ID');
  }
}

export default {
  createStore,
  getStores,
  getStoreById,
  updateStore,
  deleteStore,
  getStoresByBrandId
}
