import crypto from 'crypto';
import User from '../models/user.model';  // Adjust the import path based on your project structure
import bcrypt from 'bcryptjs';

import { sendEmail } from '../utils/forgotPasswordEmail';  // Update to the new function name

export const forgotPasswordService = {
  // Request a password reset by sending an OTP to the user's email
  requestReset: async (email: string) => {
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error('Email not found.');
    }

    // Generate a 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Set OTP and expiration time (2 minutes from now)
    user.resetOTP = otp;
    user.otpExpires = new Date(Date.now() + 2 * 60 * 1000);  // OTP expires in 2 minutes

    await user.save();

    // Send the OTP to the user's email
    await sendEmail(user.email, 'Password Reset OTP', `Your OTP for password reset is: ${otp}. It will expire in 2 minutes.`);
  },

  // Verify the OTP entered by the user
  verifyOTP: async (email: string, otp: string): Promise<boolean> => {
    const user = await User.findOne({ email, resetOTP: otp });
  
    if (!user) {
      console.log("No user found with this OTP.");
      return false;  // Invalid OTP
    }
  
    console.log("OTP expires at:", user.otpExpires);
    console.log("Current time:", new Date());
  
    // Check if OTP has expired
    if (user.otpExpires && user.otpExpires.getTime() < new Date().getTime()) {
      console.log("OTP has expired.");
      return false;  // OTP expired
    }
  
    // OTP is valid; clear OTP and expiration time
    user.resetOTP = undefined;
    user.otpExpires = undefined;
    await user.save();
  
    console.log("OTP verified successfully.");
    return true;  // OTP verified successfully
  },
  

  // Resend a new OTP to the user's email
  resendOTP: async (email: string) => {
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error('Email not found.');
    }

    // Generate a new OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Update OTP and expiration time
    user.resetOTP = otp;
    user.otpExpires = new Date(Date.now() + 2 * 60 * 1000);  // OTP expires in 2 minutes

    await user.save();

    // Send the new OTP to the user's email
    await sendEmail(user.email, 'Password Reset OTP', `Your new OTP for password reset is: ${otp}. It will expire in 2 minutes.`);
  },

  // Set the new password after OTP verification
  setNewPassword: async (email: string, newPassword: string) => {
    const user = await User.findOne({ email });
  
    if (!user) throw new Error('User not found.');
  
    // Hash the new password explicitly
    const hashedPassword = await bcrypt.hash(newPassword, 10);
  
    user.password = hashedPassword; // Set hashed password
    user.resetOTP = undefined; // Clear OTP fields
    user.otpExpires = undefined;
  
    const updatedUser = await user.save(); // Save the updated user
    if (!updatedUser) {
      throw new Error('Password update failed.');
    }
  
    // Send notification email
    await sendEmail(user.email, 'Your Password Has Been Updated', 'Your password has been successfully updated.');
  }
};

