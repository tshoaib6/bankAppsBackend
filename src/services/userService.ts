import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User, { IUser } from '../models/user.model';
import { sendVerificationEmail } from '../utils/emailService';
import { logUserActivity } from '../services/userHistory';
import admin from 'firebase-admin'; // Make sure Firebase Admin SDK is initialized elsewhere
import { paginate } from '../utils/pagination';
import { Parser } from "json2csv";
import fs from "fs";
import path from "path";
import { sendResetPasswordEmail } from '../utils/sendResetPasswordEmail';
/**
 * Register a new user
 * Brand assignment is handled separately after login
 */
export const registerUser = async (
  name: string,
  email: string,
  password: string,
  date_of_birth: Date,
  is_over_18: boolean,
  address?: string,
  parish?: string,
  userRole: 'user' | 'admin' = 'user'
): Promise<IUser | null> => {
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("This email is already registered. Please try logging in.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationTokenExpiry = new Date(Date.now() + 1000 * 60 * 10);

    const userPayload: Partial<IUser> = {
      name,
      email,
      date_of_birth,
      is_over_18,
      parish,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpiry,
      userRole,
    };

    if (address) {
      userPayload.address = address;
    }

    const newUser: IUser = new User(userPayload);

    await newUser.save();
    await sendVerificationEmail(email, verificationToken, name);

    return newUser;
  } catch (error: any) {
    console.error("Error in registerUser service:", error);

    // ✅ Pass specific error messages to frontend
    if (error.message.includes("already registered")) {
      throw new Error("This email is already registered. Please use another email.");
    }

    if (error.name === "ValidationError") {
      throw new Error("Invalid data provided. Please check your input.");
    }

    throw new Error("Something went wrong while registering. Please try again later.");
  }
};





/**
 * Login user
 */
export const loginUserService = async (
  email: string,
  password: string
): Promise<IUser | null> => {
  try {
    const user = await User.findOne({ email });
    if (!user) throw new Error("Invalid email or password");

    // ✅ Check password first
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) throw new Error("Invalid email or password");

    // ✅ If email not verified, generate OTP and send again
    if (!user.isVerified) {
      const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
      const verificationTokenExpiry = new Date(Date.now() + 1000 * 60 * 10); // 10 min

      user.verificationToken = verificationToken;
      user.verificationTokenExpiry = verificationTokenExpiry;
      await user.save();

      await sendVerificationEmail(user.email, verificationToken, user.name);

      throw new Error("Email not verified. A new verification code has been sent.");
    }

    return user;
  } catch (error: any) {
    console.error("Error in loginUserService:", error.message);
    throw error;
  }
};
 
/**
 * Get all users
 * Optional brandId filter supports brandPoints
 */
// export const getAllUsers = async (
//   page: number,
//   limit: number,
//   brandId?: string
// ): Promise<{
//   users: IUser[];
//   totalCount: number;
//   totalPages: number;
//   currentPage: number;
// }> => {
//   try {
//     const filter = brandId ? { "brandPoints.brand": brandId } : {};

//     const { data: users, totalCount, totalPages, currentPage } =
//       await paginate<IUser>(User, {
//         page,
//         limit,
//         filter,
//         sort: { createdAt: -1 }, // newest users first
//       });

//     return {
//       users,
//       totalCount,
//       totalPages,
//       currentPage,
//     };
//   } catch (error) {
//     console.error("Error in getAllUsers service:", error);
//     throw new Error("Error fetching users");
//   }
// };




export const getAllUsers = async (
  page: number,
  limit: number,
  brandId?: string,
  search?: string
): Promise<{
  users: IUser[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}> => {
  try {
    const filter: any = {};

    // Brand filter
    if (brandId) {
      filter["brandPoints.brand"] = brandId;
    }

    // Search filter (example: by name, email, etc.)
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const { data: users, totalCount, totalPages, currentPage } =
      await paginate<IUser>(User, {
        page,
        limit,
        filter,
        sort: { createdAt: -1 }, // newest users first
      });

    return {
      users,
      totalCount,
      totalPages,
      currentPage,
    };
  } catch (error) {
    console.error("Error in getAllUsers service:", error);
    throw new Error("Error fetching users");
  }
};


/**
 * Update user active status
 */
export const updateUserStatusService = async (
  userId: string,
  isActive: boolean
): Promise<IUser | null> => {
  try {
    return await User.findByIdAndUpdate(userId, { isActive }, { new: true });
  } catch (error) {
    console.error('Error in updateUserStatusService:', error);
    throw new Error('Error updating user status');
  }
};

/**
 * Delete user
 */
export const deleteUserService = async (
  userId: string
): Promise<IUser | null> => {
  try {
    return await User.findByIdAndDelete(userId);
  } catch (error) {
    console.error('Error in deleteUserService:', error);
    throw new Error('Error deleting user');
  }
};

/**
 * Email verification
 */
export const verifyEmailService = async (
  code: string
): Promise<IUser | null> => {
  try {
    const user = await User.findOne({ verificationToken: code });

    if (!user) throw new Error('Invalid verification code');

    if (
      user.verificationTokenExpiry &&
      user.verificationTokenExpiry < new Date()
    ) {
      throw new Error('Verification code has expired');
    }

    user.isVerified = true;
    user.verificationToken = '';
    user.verificationTokenExpiry = null;
    await user.save();

    return user;
  } catch (error) {
    console.error('Error in verifyEmailService:', error);
    throw new Error('Error verifying email');
  }
};


export const getUsersByAddress = async (
  address?: string
): Promise<IUser[]> => {
  try {
    const filter: any = { fcmToken: { $ne: null } };
    if (address) {
      filter.address = address; // ✅ only filter if address provided
    }

    const users = await User.find(filter);
    return users.filter(
      user =>
        typeof user.fcmToken === 'string' &&
        user.fcmToken.trim().length > 0
    );
  } catch (error) {
    console.error('Error in getUsersByAddress service:', error);
    throw new Error('Error retrieving users by address');
  }
};

export const exportUsersToCSVService = async (): Promise<string> => {
  const users = await User.find().lean();

  if (!users || users.length === 0) {
    throw new Error("No users found to export");
  }

  const fields = [
    "name",
    "email",
    "date_of_birth",
    "is_over_18",
    "address",
    "parish",
    "userRole",
    "isVerified",
    "isActive",
    "createdAt",
  ];

  const json2csvParser = new Parser({ fields });
  return json2csvParser.parse(users); // return CSV as string
};


/**
 * Send OTP for password reset
 */
/**
 * Send OTP for password reset
 */
export const sendForgotPasswordOTPService = async (
  email: string
): Promise<string> => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("No account found with this email");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins expiry

    user.resetOTP = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // send email
await sendResetPasswordEmail(email, otp, user.name);

    return "OTP sent to your email";
  } catch (error) {
    console.error("Error in sendForgotPasswordOTPService:", error);
    throw new Error("Error sending OTP");
  }
};

/**
 * Resend OTP for password reset
 */
export const resendForgotPasswordOTPService = async (
  email: string
): Promise<string> => {
  try {
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.resetOTP = otp;
    user.otpExpires = otpExpires;
    await user.save();

    await sendResetPasswordEmail(email, otp, user.name);

    return "New OTP has been sent";
  } catch (error) {
    console.error("Error in resendForgotPasswordOTPService:", error);
    throw new Error("Error resending OTP");
  }
};

/**
 * Verify OTP (Step 2 of flow)
 */
export const verifyForgotPasswordOTPService = async (
  email: string,
  otp: string
): Promise<string> => {
  try {
    const user = await User.findOne({ email, resetOTP: otp });
    if (!user) throw new Error("Invalid OTP");

    if (!user.otpExpires || user.otpExpires < new Date()) {
      throw new Error("OTP has expired");
    }

    // ✅ OTP is correct → Clear OTP so it cannot be reused
    user.resetOTP = undefined;
    user.otpExpires = undefined;
    await user.save();

    return "OTP verified successfully";
  } catch (error) {
    console.error("Error in verifyForgotPasswordOTPService:", error);
    throw new Error("Error verifying OTP");
  }
};

/**
 * Reset password (Step 3 of flow)
 * Only works if OTP was already verified (since we cleared OTP in previous step)
 */
export const resetPasswordWithOTPService = async (
  email: string,
  newPassword: string
): Promise<string> => {
  try {
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");

    // ✅ Just update password (OTP already verified earlier)
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();

    return "Password reset successful";
  } catch (error) {
    console.error("Error in resetPasswordWithOTPService:", error);
    throw new Error("Error resetting password");
  }
};

