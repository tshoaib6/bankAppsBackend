import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User, { IUser } from '../models/user.model';
import { sendVerificationEmail } from '../utils/emailService'; 
import { logUserActivity } from '../services/userHistory';


// export const registerUser = async (
//     name: string, 
//     email: string, 
//     password: string, 
//     date_of_birth: Date, 
//     is_over_18: boolean
//   ): Promise<IUser | null> => {
//     try {
//       // Check if the user with the provided email already exists
//       const existingUser = await User.findOne({ email });
//       if (existingUser) throw new Error('Email already exists');
  
//       // Hash the password before saving it
//       const hashedPassword = await bcrypt.hash(password, 10);
  
//       // Generate a unique email verification token
//       const verificationToken = crypto.randomBytes(32).toString('hex');
//       const verificationTokenExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24); // Token valid for 24 hours
  
//       // Create a new user instance
//       const newUser = new User({
//         name,
//         email,
//         date_of_birth,
//         is_over_18,
//         password: hashedPassword,
//         verificationToken,
//         verificationTokenExpiry,
//       });
  
//       // Save the user to the database
//       await newUser.save();
  
//       // Send verification email
//       await sendVerificationEmail(email, verificationToken); // Send the email after saving the user
  
//       return newUser;
//     } catch (error) {
//       console.error('Error in registerUser service:', error);
//       throw new Error('Error registering user');
//     }
//   };




export const registerUser = async (
    name: string,
    email: string,
    password: string,
    date_of_birth: Date,
    is_over_18: boolean
  ): Promise<IUser | null> => {
    try {
      // Check if the user with the provided email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) throw new Error('Email already exists');
  
      // Hash the password before saving it
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Generate a unique email verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationTokenExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24); // Token valid for 24 hours
  
      // Create a new user instance
      const newUser: IUser = new User({
        name,
        email,
        date_of_birth,
        is_over_18,
        password: hashedPassword,
        verificationToken,
        verificationTokenExpiry,
      });
  
      // Save the user to the database
      await newUser.save();
  
      // Send verification email
      await sendVerificationEmail(email, verificationToken);
  
      // Log the signup activity
      // await logUserActivity(
      //   newUser._id.toString(), // Convert _id to a string
      //   'User signed up successfully.', // Description
      //   'signup', // Type
      //   0, // Points earned
      //   0 // Points used
      // );
  
      return newUser;
    } catch (error) {
      console.error('Error in registerUser service:', error);
      throw new Error('Error registering user');
    }
  };

export const loginUserService = async (email: string, password: string): Promise<IUser | null> => {
  try {
    const user = await User.findOne({ email });
    if (!user) throw new Error('User not found');

    // Check if the user's email is verified
    if (!user.isVerified) throw new Error('Email is not verified');

    // Compare the provided password with the stored hashed password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) throw new Error('Invalid email or password');

    return user;
  } catch (error) {
    console.error('Error in loginUserService:', error);
    throw new Error('Error logging in');
  }
};


export const getAllUsers = async (): Promise<IUser[]> => {
  try {
    const users = await User.find({});
    return users;
  } catch (error) {
    console.error('Error in getAllUsers service:', error);
    throw new Error('Error fetching users');
  }
};


export const updateUserStatusService = async (userId: string, isActive: boolean): Promise<IUser | null> => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { isActive }, 
      { new: true } // Return the updated document
    );
    return updatedUser;
  } catch (error) {
    console.error('Error in updateUserStatusService:', error);
    throw new Error('Error updating user status');
  }
};

export const deleteUserService = async (userId: string): Promise<IUser | null> => {
  try {
    const deletedUser = await User.findByIdAndDelete(userId);
    return deletedUser;
  } catch (error) {
    console.error('Error in deleteUserService:', error);
    throw new Error('Error deleting user');
  }
};

export const verifyEmailService = async (token: string): Promise<IUser | null> => {
  try {
    // Find the user with the provided token
    const user = await User.findOne({ verificationToken: token });
    if (!user) throw new Error('Invalid token');

    // Check if the token has expired
    if (user.verificationTokenExpiry && user.verificationTokenExpiry < new Date()) {
      throw new Error('Token has expired');
    }

    // Update the user's status to verified
    user.isVerified = true;
    user.verificationToken = ''; // Clear the token after successful verification
    user.verificationTokenExpiry = null; // Clear expiry date, set to null instead of undefined
    await user.save();

    return user;
  } catch (error) {
    console.error('Error in verifyEmailService:', error);
    throw new Error('Error verifying email');
  }
};
