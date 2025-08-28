import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  date_of_birth: Date;
  is_over_18: boolean;
  scanned_qr_codes: string[];
  created_at: Date;
  password: string;
  isActive: boolean;
  isVerified: boolean;
  verificationToken: string;
  verificationTokenExpiry: Date | null;
  resetOTP?: string;
  otpExpires?: Date;
  address?: string; // ✅ optional now
  parish: string;
  fcmToken?: string;

  brandPoints: {
    brand: mongoose.Types.ObjectId;
    points: number;
  }[];

  // ✅ Added userRole
  userRole: 'user' | 'admin';
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    date_of_birth: { type: Date, required: true },
    is_over_18: { type: Boolean, required: true },
    scanned_qr_codes: { type: [String], default: [] },
    created_at: { type: Date, default: Date.now },
    password: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenExpiry: { type: Date, default: null },
    resetOTP: { type: String },
    otpExpires: { type: Date },
    address: { type: String, required: false },
    parish: { type: String, required: true },
    fcmToken: { type: String },

    // ✅ New userRole field
    userRole: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },

    brandPoints: [
      {
        brand: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Brand',
          required: true,
        },
        points: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
