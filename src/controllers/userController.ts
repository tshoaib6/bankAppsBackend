import { Request, Response } from 'express';
import { 
  registerUser, 
  loginUserService, 
  getAllUsers, 
  updateUserStatusService, 
  deleteUserService, 
  verifyEmailService 
} from '../services/userService';
import { validateEmail, validateName, validatePassword } from '../utils/validators';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';

// ===============================
// REGISTER USER
// ===============================
export const register = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, password, date_of_birth, is_over_18 } = req.body;

    // Input validation
    if (!validateName(name)) return res.status(400).json({ message: 'Invalid name' });
    if (!validateEmail(email)) return res.status(400).json({ message: 'Invalid email' });
    if (!validatePassword(password)) return res.status(400).json({ message: 'Password must be at least 6 characters' });

    // Register user service call
    const newUser = await registerUser(name, email, password, date_of_birth, is_over_18);

    res.status(201).json({ 
      message: 'User registered successfully. Please check your email to verify your account.', 
      user: newUser 
    });
  } catch (error) {
    console.error('Error in user registration:', error);
    res.status(500).json({ message: 'Server error, please try again' });
  }
};

// ===============================
// LOGIN USER
// ===============================
export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!validateEmail(email)) return res.status(400).json({ message: 'Invalid email' });
    if (!validatePassword(password)) return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const user = await loginUserService(email, password);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    if (!user.isVerified) {
      return res.status(401).json({ message: 'Please verify your email to log in.' });
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { name: user.name, email: user.email, points: user.points },
    });
  } catch (error) {
    console.error('Error in user login:', error);
    res.status(500).json({ message: 'Server error, please try again' });
  }
};

// ===============================
// GET ALL USERS
// ===============================
export const getUsers = async (req: Request, res: Response): Promise<any> => {
  try {
    const users = await getAllUsers();
    if (!users || users.length === 0) return res.status(404).json({ message: 'No users found' });

    res.status(200).json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error, please try again' });
  }
};

// ===============================
// UPDATE USER STATUS (Block/Unblock)
// ===============================
export const updateUserStatus = async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = req.params; 
    const { isActive } = req.body; 

    if (typeof isActive !== 'boolean') return res.status(400).json({ message: 'Invalid status value. It must be a boolean.' });

    const updatedUser = await updateUserStatusService(userId, isActive);
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({
      message: isActive ? 'User has been unblocked successfully' : 'User has been blocked successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Failed to update user status. Please try again later.' });
  }
};

// ===============================
// DELETE USER
// ===============================
export const deleteUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = req.params; 
    const deletedUser = await deleteUserService(userId);

    if (!deletedUser) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'User deleted successfully', user: deletedUser });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user. Please try again later.' });
  }
};

// ===============================
// VERIFY EMAIL
// ===============================
export const verifyEmail = async (req: Request, res: Response): Promise<any> => {
  try {
    const { token } = req.params; // Token from URL params

    const verifiedUser = await verifyEmailService(token);
    if (!verifiedUser) return res.status(400).json({ message: 'Invalid or expired verification token.' });

    res.status(200).json({ message: 'Email verified successfully!', user: verifiedUser });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ message: 'Failed to verify email. Please try again later.' });
  }
};
