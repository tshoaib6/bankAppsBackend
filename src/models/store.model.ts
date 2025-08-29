import mongoose, { Document, Schema } from "mongoose";

export interface IStore extends Document {
  customerNumber: string;   // stays same as in CSV
  customerName: string;     // stays same as in CSV
  address: string;
  parish: string;
  telephoneNumber: string;
  location: {
    latitude: number;
    longitude: number;
  };
  isActive?: boolean;
}

const StoreSchema: Schema<IStore> = new Schema(
  {
    customerNumber: { type: String, required: true, unique: true }, // e.g. 1016595
    customerName: { type: String, required: true },                 // e.g. KEITHA PARRIS
    address: { type: String, required: true },                      // e.g. LOT #1 GOODLAND
    parish: { type: String, required: true },                       // e.g. Christ Church
    telephoneNumber: { type: String, required: true },              // e.g. 2462496195
    location: {
      latitude: { type: Number, required: true },                   // e.g. 13.052778
      longitude: { type: Number, required: true },                  // e.g. -59.522483
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Store = mongoose.model<IStore>("Store", StoreSchema);

export default Store;
