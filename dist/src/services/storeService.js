"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const store_model_1 = __importDefault(require("../models/store.model"));
const createStore = (storeData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const store = new store_model_1.default(storeData);
        return yield store.save();
    }
    catch (error) {
        console.error('Error creating store:', error);
        throw new Error('Failed to create store. Please try again.');
    }
});
const getStores = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield store_model_1.default.find();
    }
    catch (error) {
        console.error('Error fetching stores:', error);
        throw new Error('Failed to fetch stores. Please try again.');
    }
});
const getStoreById = (storeId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const store = yield store_model_1.default.findById(storeId);
        if (!store) {
            throw new Error('Store not found');
        }
        return store;
    }
    catch (error) {
        console.error(`Error fetching store with ID ${storeId}:`, error);
        throw new Error(error.message || 'Failed to fetch store. Please try again.');
    }
});
const updateStore = (storeId, updates) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const store = yield store_model_1.default.findById(storeId);
        if (!store) {
            throw new Error('Store not found');
        }
        const updatedStore = yield store_model_1.default.findByIdAndUpdate(storeId, updates, {
            new: true
        });
        if (!updatedStore) {
            throw new Error('Failed to update store. Please try again.');
        }
        return updatedStore;
    }
    catch (error) {
        console.error(`Error updating store with ID ${storeId}:`, error);
        throw new Error(error.message || 'Failed to update store. Please try again.');
    }
});
const deleteStore = (storeId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const store = yield store_model_1.default.findById(storeId);
        if (!store) {
            throw new Error('Store not found');
        }
        const deletedStore = yield store_model_1.default.findByIdAndDelete(storeId);
        if (!deletedStore) {
            throw new Error('Failed to delete store. Please try again.');
        }
        return deletedStore;
    }
    catch (error) {
        console.error(`Error deleting store with ID ${storeId}:`, error);
        throw new Error(error.message || 'Failed to delete store. Please try again.');
    }
});
exports.default = {
    createStore,
    getStores,
    getStoreById,
    updateStore,
    deleteStore
};
