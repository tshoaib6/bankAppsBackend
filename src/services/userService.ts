import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User, { IUser } from '../models/user.model';
import { sendVerificationEmail } from '../utils/emailService';
import { logUserActivity } from '../services/userHistory';
import admin from 'firebase-admin'; // Make sure Firebase Admin SDK is initialized elsewhere
import { paginate } from '../utils/pagination';

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
  address?: string, // ✅ optional now
  parish?: string,
  userRole: 'user' | 'admin' = 'user'
): Promise<IUser | null> => {
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new Error('Email already exists');

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationTokenExpiry = new Date(Date.now() + 1000 * 60 * 10);

    // ✅ Build user payload dynamically so optional fields are not forced
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
      userPayload.address = address; // ✅ only add if provided
    }

    const newUser: IUser = new User(userPayload);

    await newUser.save();
    await sendVerificationEmail(email, verificationToken);

    return newUser;
  } catch (error) {
    console.error('Error in registerUser service:', error);
    throw new Error('Error registering user');
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
    if (!user) throw new Error('User not found');

    if (!user.isVerified) throw new Error('Email is not verified');

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) throw new Error('Invalid email or password');

    return user;
  } catch (error) {
    console.error('Error in loginUserService:', error);
    throw new Error('Error logging in');
  }
};

/**
 * Get all users
 * Optional brandId filter supports brandPoints
 */
export const getAllUsers = async (
  page: number,
  limit: number,
  brandId?: string
): Promise<{
  users: IUser[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}> => {
  try {
    const filter = brandId ? { "brandPoints.brand": brandId } : {};

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