import mongoose, { Document, Schema } from 'mongoose';

export interface IQRCode extends Document {
  code: string;
  codeUrl: string;
  points: number;
  isUsed: boolean;
  claimedBy?: mongoose.Schema.Types.ObjectId | null;
  claimedAt?: Date | null;
  brand?: string | null;   // ✅ brand is now a simple string
}

const QRCodeSchema: Schema<IQRCode> = new Schema(
  {
    code: { type: String, required: true, unique: true },
    codeUrl: { type: String, required: true },
    points: { type: Number, required: true, default: 0 },
    isUsed: { type: Boolean, default: false },
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    claimedAt: {
      type: Date,
      default: null,
    },
    brand: { type: String, default: null },   // ✅ changed from ObjectId ref → String
  },
  { timestamps: true }
);

const QRCode = mongoose.model<IQRCode>('QRCode', QRCodeSchema);

export default QRCode;
