import mongoose, { Schema, Document } from 'mongoose';

export interface IBrand extends Document {
  brandName: string;
  description?: string;
  logo?: string;
  createdBy: mongoose.Types.ObjectId;
  settings?: {
    themeColor?: string;
    maxPointsPerDay?: number;
    allowQRCodeReuse?: boolean;
  };
  isActive: boolean;
}

const BrandSchema: Schema<IBrand> = new Schema(
  {
    brandName: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    logo: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId, // ✅ Corrected here
      ref: 'User',
      required: true,
    },
    settings: {
      themeColor: { type: String, default: '#000000' },
      maxPointsPerDay: { type: Number, default: 100 },
      allowQRCodeReuse: { type: Boolean, default: false },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Brand = mongoose.model<IBrand>('Brand', BrandSchema);

export default Brand;
