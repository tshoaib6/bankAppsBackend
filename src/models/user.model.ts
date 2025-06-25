import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  date_of_birth: Date;
  is_over_18: boolean;
  points: number;
  scanned_qr_codes: string[];
  created_at: Date;
  password: string;
  isActive: boolean;
  isVerified: boolean;
  verificationToken: string;
  verificationTokenExpiry: Date | null;
  resetOTP?: string;
  otpExpires?: Date;
  brand: mongoose.Types.ObjectId; // ✅ New field
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    date_of_birth: { type: Date, required: true },
    is_over_18: { type: Boolean, required: true },
    points: { type: Number, default: 0 },
    scanned_qr_codes: { type: [String], default: [] },
    created_at: { type: Date, default: Date.now },
    password: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenExpiry: { type: Date, default: null },
    resetOTP: { type: String },
    otpExpires: { type: Date },

    // ✅ New: Reference to Brand
    brand: {
      type: Schema.Types.ObjectId,
      ref: 'Brand',
      required: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
