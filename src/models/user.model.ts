import mongoose, { Document, Schema } from 'mongoose';

// Define the interface for the User document
export interface IUser extends Document {
  name: string;
  email: string;
  date_of_birth: Date;
  is_over_18: boolean;
  points: number;
  scanned_qr_codes: string[];
  created_at: Date;
  password: string;  // Add the password field
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
    password: { type: String, required: true }, // Add password to schema
  },
  { timestamps: true } // Automatically adds `createdAt` and `updatedAt` fields
);

// Create the User model
const User = mongoose.model<IUser>('User', UserSchema);

export default User;
