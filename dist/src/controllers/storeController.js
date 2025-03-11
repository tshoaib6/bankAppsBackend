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
exports.deleteStore = exports.updateStore = exports.getStoreById = exports.getStores = exports.createStore = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const storeService_1 = __importDefault(require("../services/storeService"));
const createStore = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        if (!token)
            return res.status(401).json({ message: 'Authorization token required' });
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        const { storeName, description, longitude, latitude } = req.body;
        if (!storeName || !description || !longitude || !latitude) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const storeData = {
            storeName,
            description,
            location: { longitude, latitude },
            createdBy: userId
        };
        const newStore = yield storeService_1.default.createStore(storeData);
        return res.status(201).json({
            store: newStore,
            message: 'Store created successfully'
        });
    }
    catch (error) {
        console.error('Error creating store:', error);
        return res
            .status(500)
            .json({ message: 'Server error while creating store' });
    }
});
exports.createStore = createStore;
const getStores = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stores = yield storeService_1.default.getStores();
        return res.status(200).json({
            stores,
            message: 'Stores fetched successfully'
        });
    }
    catch (error) {
        console.error('Error fetching stores:', error);
        return res
            .status(500)
            .json({ message: 'Server error while fetching stores' });
    }
});
exports.getStores = getStores;
const getStoreById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { storeId } = req.params;
        const store = yield storeService_1.default.getStoreById(storeId);
        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }
        return res.status(200).json({
            store,
            message: 'Store fetched successfully'
        });
    }
    catch (error) {
        console.error('Error fetching store:', error);
        return res
            .status(500)
            .json({ message: 'Server error while fetching store' });
    }
});
exports.getStoreById = getStoreById;
const updateStore = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { storeId } = req.params;
        const updates = req.body;
        const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        if (!token)
            return res.status(401).json({ message: 'Authorization token required' });
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        }
        catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    message: 'Your session has expired. Please log in again.',
                    expiredAt: error.expiredAt
                });
            }
            return res.status(401).json({ message: 'Invalid token' });
        }
        const userId = decoded.userId;
        const existingStore = yield storeService_1.default.getStoreById(storeId);
        if (!existingStore) {
            return res.status(404).json({ message: 'Store not found' });
        }
        if (existingStore.createdBy.toString() !== userId) {
            return res
                .status(403)
                .json({ message: 'You are not authorized to update this store' });
        }
        const updatedStore = yield storeService_1.default.updateStore(storeId, updates);
        return res.status(200).json({
            store: updatedStore,
            message: 'Store updated successfully'
        });
    }
    catch (error) {
        console.error('Error updating store:', error);
        return res
            .status(500)
            .json({ message: 'Server error while updating store' });
    }
});
exports.updateStore = updateStore;
const deleteStore = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { storeId } = req.params;
        const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        if (!token)
            return res.status(401).json({ message: 'Authorization token required' });
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        const existingStore = yield storeService_1.default.getStoreById(storeId);
        if (!existingStore) {
            return res.status(404).json({ message: 'Store not found' });
        }
        if (existingStore.createdBy.toString() !== userId) {
            return res
                .status(403)
                .json({ message: 'You are not authorized to delete this store' });
        }
        yield storeService_1.default.deleteStore(storeId);
        return res.status(200).json({ message: 'Store deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting store:', error);
        return res
            .status(500)
            .json({ message: 'Server error while deleting store' });
    }
});
exports.deleteStore = deleteStore;
