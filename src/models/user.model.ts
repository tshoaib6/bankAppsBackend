// import mongoose, { Document, Schema } from 'mongoose';

// // Define the interface for the User document
// export interface IUser extends Document {
//   name: string;
//   email: string;
//   date_of_birth: Date;
//   is_over_18: boolean;
//   points: number;
//   scanned_qr_codes: string[];
//   created_at: Date;
//   password: string;
//   isActive: boolean; // User active status
//   isVerified: boolean; // Indicates if the user's email is verified
//   verificationToken: string; // Token for email verification
//   verificationTokenExpiry: Date | null;  // Allow null
//   resetOTP: string | undefined;  // OTP for password reset
//   otpExpires: Date | undefined;  // Expiration time for OTP
// }

// // Define the schema for the User model
// const UserSchema: Schema<IUser> = new Schema(
//   {
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     date_of_birth: { type: Date, required: true },
//     is_over_18: { type: Boolean, required: true },
//     points: { type: Number, default: 0 },
//     scanned_qr_codes: { type: [String], default: [] },
//     created_at: { type: Date, default: Date.now },
//     password: { type: String, required: true },
//     isActive: { type: Boolean, default: true },  // Default to true, meaning user is active
//     isVerified: { type: Boolean, default: false }, // Email is not verified by default
//     verificationToken: { type: String }, // Token used for email verification
//     verificationTokenExpiry: { type: Date, default: null },  // Allow null for expiry date
//     resetOTP: { type: String, default: undefined },  // OTP for password reset (nullable)
//     otpExpires: { type: Date, default: undefined },  // Expiration time for OTP (nullable)
//   },
//   { timestamps: true } // Automatically adds `createdAt` and `updatedAt` fields
// );

// // Create the User model
// const User = mongoose.model<IUser>('User', UserSchema);

// export default User;



import mongoose, { Document, Schema } from 'mongoose';

// Define the interface for the User document
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId; // Explicitly define the type of _id
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
  resetOTP: string | undefined;
  otpExpires: Date | undefined;
}

// Define the schema for the User model
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
    resetOTP: { type: String, default: undefined },
    otpExpires: { type: Date, default: undefined },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>('User', UserSchema);
export default User;
