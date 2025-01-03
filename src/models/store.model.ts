import mongoose, { Document, Schema } from 'mongoose';

export interface IStore extends Document {
  storeName: string;
  description: string;
  location: {
    longitude: number;
    latitude: number;
  };
  createdBy: mongoose.Schema.Types.ObjectId;
}

const StoreSchema: Schema = new Schema(
  {
    storeName: { type: String, required: true },
    description: { type: String, required: true },
    location: {
      longitude: { type: Number, required: true },
      latitude: { type: Number, required: true },
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const Store = mongoose.model<IStore>('Store', StoreSchema);

export default Store;
