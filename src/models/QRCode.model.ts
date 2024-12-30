import mongoose, { Document, Schema } from 'mongoose';

// Interface for the QRCode model
export interface IQRCode extends Document {
  code: string;
  points: number;
  isUsed: boolean;
  createdBy: mongoose.Schema.Types.ObjectId; // Reference to the User ID
}

const QRCodeSchema: Schema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    points: { type: Number, required: true },
    isUsed: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User
  },
  { timestamps: true }
);

const QRCode = mongoose.model<IQRCode>('QRCode', QRCodeSchema);

export default QRCode;
