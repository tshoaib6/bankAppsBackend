import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User, { IUser } from '../models/user.model';
import { sendVerificationEmail } from '../utils/emailService';
import { logUserActivity } from '../services/userHistory';

/**
 * Register a new user
 * Brand assignment is handled separately after login
 */
export const registerUser = async (
  name: string,
  email: string,
  password: string,
  date_of_birth: Date,
  is_over_18: boolean
): Promise<IUser | null> => {
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new Error('Email already exists');

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hrs

    const newUser: IUser = new User({
      name,
      email,
      date_of_birth,
      is_over_18,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpiry,
      // ❌ brands: [] => removed
    });

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
export const getAllUsers = async (brandId?: string): Promise<IUser[]> => {
  try {
    const filter = brandId
      ? { 'brandPoints.brand': brandId } // ✅ updated filtering logic
      : {};
    return await User.find(filter);
  } catch (error) {
    console.error('Error in getAllUsers service:', error);
    throw new Error('Error fetching users');
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
  token: string
): Promise<IUser | null> => {
  try {
    const user = await User.findOne({ verificationToken: token });
    if (!user) throw new Error('Invalid token');

    if (
      user.verificationTokenExpiry &&
      user.verificationTokenExpiry < new Date()
    ) {
      throw new Error('Token has expired');
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
