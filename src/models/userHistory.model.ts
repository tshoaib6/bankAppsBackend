import mongoose, { Document, Schema } from 'mongoose';

// Define the interface for the History document
interface IHistory extends Document {
  user_id: mongoose.Schema.Types.ObjectId; // Reference to User model
  date: Date;
  description: string;
  points_earned?: number;
  points_used?: string;
  type: string;
  qrCode: string; // The QR code scanned

  reference_id?: string;
}

// Define the schema for the History model
const HistorySchema: Schema<IHistory> = new Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User
    date: { type: Date, required: false },
    description: { type: String, required: false },
    points_earned: { type: Number, default: 0 },
    qrCode: { type: String, required: true },

    points_used: { type: String, default: '0' },
    type: { type: String, required: false },
    reference_id: { type: String, default: '' },
  },
  { timestamps: true } // Automatically adds `createdAt` and `updatedAt` fields
);

// Create the History model
const History = mongoose.model<IHistory>('userHistory', HistorySchema);

export default History;
