import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import History from '../models/userHistory.model'; // Import the History model

// Controller to get all history of a specific user
export const getUserHistory = async (req: Request, res: Response):Promise<any> => {
  try {
    // Extract the token from the 'Authorization' header
    const token = req.header('Authorization')?.replace('Bearer ', ''); // Assuming the token is sent as 'Bearer <token>'

    if (!token) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    // Decode the JWT to get the user ID
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!); // Replace with your JWT secret key

    const userId = decoded.userId; // Assuming the token contains a 'userId' field

    // Fetch the history entries for the logged-in user
    const userHistory = await History.find({ user_id: userId }).sort({ date: -1 }); // Sort by date in descending order

    if (!userHistory || userHistory.length === 0) {
      return res.status(404).json({ message: 'No activity found for this user' });
    }

    return res.status(200).json({ userHistory });
  } catch (error) {
    console.error('Error fetching user history:', error);
    return res.status(500).json({ message: 'Server error while fetching user history' });
  }
};
