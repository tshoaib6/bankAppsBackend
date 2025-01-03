import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import History from '../models/userHistory.model'

export const getUserHistory = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ message: 'Authorization token required' })
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!)

    const userId = decoded.userId
    const userHistory = await History.find({ user_id: userId }).sort({
      date: -1
    })

    if (!userHistory || userHistory.length === 0) {
      return res
        .status(404)
        .json({ message: 'No activity found for this user' })
    }

    return res.status(200).json({ userHistory })
  } catch (error) {
    console.error('Error fetching user history:', error)
    return res
      .status(500)
      .json({ message: 'Server error while fetching user history' })
  }
}
