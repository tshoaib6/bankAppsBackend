import { Request, Response } from 'express';
import { registerUser, loginUserService,getAllUsers } from '../services/userService';
import { validateEmail, validateName, validatePassword } from '../utils/validators';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';

// Register route handler
export const register = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, password, date_of_birth, is_over_18 } = req.body;

    // Validation logic
    if (!validateName(name)) {
      return res.status(400).json({ message: 'Invalid name' });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email' });
    }
    if (!validatePassword(password)) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Register new user
    const newUser = await registerUser(name, email, password, date_of_birth, is_over_18);
    res.status(201).json({ message: 'User registered successfully', user: newUser });
    // No need to return the response here, the response is sent to the client
  } catch (error) {
    console.error('Error in user registration:', error);
    res.status(500).json({ message: 'Server error, please try again' });
  }
};

// Login route handler
export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    // Validate email
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email' });
    }

    // Validate password
    if (!validatePassword(password)) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Attempt login
    const user = await loginUserService(email, password);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'secret', // Use a proper secret
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        name: user.name,
        email: user.email,
        points: user.points, // Assuming `points` is part of the user model
      },
    });
    // No need to return the response here, the response is sent to the client
  } catch (error) {
    console.error('Error in user login:', error);
    res.status(500).json({ message: 'Server error, please try again' });
  }
};


export const getUsers = async (req: Request, res: Response): Promise<any> => {
    try {
      // Fetch all users from the database
      const users = await getAllUsers(); // This function should be implemented in the service layer
  
      if (!users || users.length === 0) {
        return res.status(404).json({ message: 'No users found' });
      }
  
      res.status(200).json({ users });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Server error, please try again' });
    }
  };


  export const updateUserStatus = async (req: Request, res: Response): Promise<any> => {
    try {
      const { userId } = req.params;  // Get userId from URL params
      const { isActive } = req.body;  // Get isActive value from request body
  
      // Validate if isActive is a boolean
      if (typeof isActive !== 'boolean') {
        return res.status(400).json({ message: 'Invalid status value. It must be a boolean.' });
      }
  
      // Find and update user status
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { isActive },
        { new: true, runValidators: true }
      ).select('name email isActive');
  
      // If the user is not found, return a 404 error
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      return res.status(200).json({
        message: isActive ? 'User has been unblocked successfully' : 'User has been blocked successfully',
        user: updatedUser,
      });
      
    } catch (error) {
      console.error('Error updating user status:', error);
      return res.status(500).json({
        message: 'Failed to update user status. Please try again later.',
      });
    }
  };
  
  // Delete user
  export const deleteUser = async (req: Request, res: Response): Promise<any> => {
    try {
      const { userId } = req.params; // Extract userId from URL params
  
      // Find and delete the user
      const deletedUser = await User.findByIdAndDelete(userId);
  
      if (!deletedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      return res.status(200).json({
        message: 'User deleted successfully',
        user: deletedUser,
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      return res.status(500).json({
        message: 'Failed to delete user. Please try again later.',
      });
    }
  };