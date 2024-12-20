import bcrypt from 'bcryptjs';
import User from '../models/user.model';
import { validateEmail, validateName, validatePassword } from '../utils/validators';
import { IUser } from '../models/user.model';
import jwt from 'jsonwebtoken';

// Register user
export const registerUser = async (
  name: string, 
  email: string, 
  password: string, 
  date_of_birth: Date, 
  is_over_18: boolean
): Promise<IUser> => {
  // Validate user input
  if (!validateEmail(email)) {
    throw new Error('Invalid email format');
  }

  if (!validateName(name)) {
    throw new Error('Invalid name format. Name must only contain letters and spaces.');
  }

  if (!validatePassword(password)) {
    throw new Error('Password must be at least 8 characters long, contain a number, and a special character.');
  }

  // Hash the password before saving
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    name,
    email,
    password: hashedPassword,
    date_of_birth,
    is_over_18,
  });

  try {
    const savedUser = await user.save();
    // Return plain object by using toObject() to avoid Mongoose methods
    const userResponse = savedUser.toObject();

    // Cast userResponse to IUser type
    return userResponse as IUser;  // Casting to IUser type
  } catch (error: any) {
    throw new Error('Error registering user: ' + error.message);
  }
};

// Login user
export const loginUserService = async (email: string, password: string): Promise<IUser & { token: string }> => {
  try {
    // Find user by email with lean() for a plain object response
    const user = await User.findOne({ email }).lean<IUser>(); // Leaning the result to get a plain object

    if (!user) {
      throw new Error('User not found');
    }

    // Compare the password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET!, { expiresIn: '1h' });

    // Clean response by ensuring no internal Mongoose properties
    const userResponse = { ...user, token };  // Add token to the plain object response

    // Manually cast the response to the expected type
    return userResponse as IUser & { token: string };  // Casting the response to IUser type with token
  } catch (error: any) {
    throw new Error('Login failed: ' + error.message);
  }
};

export const getAllUsers = async (): Promise<IUser[]> => {
    try {
      // Fetch all users from the database using the lean() method for plain objects
      const users = await User.find().lean<IUser[]>(); // This will return a plain array of IUser objects
      return users;
    } catch (error: any) {
      throw new Error('Error fetching users: ' + error.message);
    }
  };