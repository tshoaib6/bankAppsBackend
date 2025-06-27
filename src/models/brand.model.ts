import mongoose, { Document, Schema } from 'mongoose';

export interface IBrand extends Document {
  brandName: string;
  description?: string;
  logo?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const BrandSchema: Schema<IBrand> = new Schema(
  {
    brandName: { type: String, required: true, unique: true },
    description: { type: String },
    logo: { type: String }, // URL or filename
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true } // adds createdAt and updatedAt
);

const Brand = mongoose.model<IBrand>('Brand', BrandSchema);

export default Brand;
