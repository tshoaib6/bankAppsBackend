import mongoose, { Document, Schema } from 'mongoose';
import { IBrand } from './brand.model';

export interface IQRCode extends Document {
  code: string;
  points: number;
  isUsed: boolean;
  createdBy: mongoose.Schema.Types.ObjectId;
  brand?: mongoose.Types.ObjectId | IBrand; // ✅ allow either ObjectId or populated object
}

const QRCodeSchema: Schema<IQRCode> = new Schema(
  {
    code: { type: String, required: true, unique: true },
    points: { type: Number, required: true },
    isUsed: { type: Boolean, default: false },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      required: true,
    },
  },
  { timestamps: true }
);

const QRCode = mongoose.model<IQRCode>('QRCode', QRCodeSchema);

export default QRCode;
