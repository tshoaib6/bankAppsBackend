import mongoose, { Document, Schema } from 'mongoose';

export interface IStore extends Document {
  storeName: string;
  description: string;
  location: {
    longitude: number;
    latitude: number;
  };
  createdBy: mongoose.Types.ObjectId;
  brand?: mongoose.Types.ObjectId;
  isActive?: boolean;
}

const StoreSchema: Schema<IStore> = new Schema(
  {
    storeName: { type: String, required: true },
    description: { type: String, required: true },
    location: {
      longitude: { type: Number, required: true },
      latitude: { type: Number, required: true },
    },
    createdBy: {
      type: Schema.Types.ObjectId, // ✅ Use Schema.Types.ObjectId
      ref: 'User',
      required: true,
    },
    brand: {
      type: Schema.Types.ObjectId, // ✅ Optional: brand reference
      ref: 'Brand',
      required: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Store = mongoose.model<IStore>('Store', StoreSchema);

export default Store;
