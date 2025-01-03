import mongoose, { Document, Schema } from 'mongoose';

export interface IQRCode extends Document {
  code: string;
  points: number;
  isUsed: boolean;
  createdBy: mongoose.Schema.Types.ObjectId; 
}

const QRCodeSchema: Schema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    points: { type: Number, required: true },
    isUsed: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  },
  { timestamps: true }
);

const QRCode = mongoose.model<IQRCode>('QRCode', QRCodeSchema);

export default QRCode;
