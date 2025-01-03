import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { forgotPasswordService } from '../services/forgotPasswordService'
import User from '../models/user.model'

const generateToken = (email: string, userId: string) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined.')
  }

  return jwt.sign({ email, userId }, process.env.JWT_SECRET as string, {
    expiresIn: '15m'
  })
}

export const requestPasswordReset = async (
  req: Request,
  res: Response
): Promise<any> => {
  const email = req.body.email

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' })
  }

  try {
    await forgotPasswordService.requestReset(email)
    return res.status(200).json({ message: 'OTP sent to email.' })
  } catch (error: any) {
    return res.status(400).json({ message: error.message })
  }
}

export const verifyOTP = async (req: Request, res: Response): Promise<any> => {
  const { email, otp } = req.body

  try {
    const isValid = await forgotPasswordService.verifyOTP(email, otp)

    if (isValid) {
      const newToken = generateToken(email, email)

      res.status(200).json({
        message:
          'OTP verified successfully. You may proceed to reset your password.',
        token: newToken
      })
    } else {
      res.status(400).json({ message: 'Invalid or expired OTP.' })
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const resendOTP = async (req: Request, res: Response): Promise<any> => {
  const email = req.body.email

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' })
  }

  try {
    await forgotPasswordService.resendOTP(email)
    res.status(200).json({ message: 'New OTP sent to your email.' })
  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}

export const setNewPassword = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { newPassword, confirmPassword } = req.body

  const authorizationHeader = req.headers['authorization']
  const token = authorizationHeader?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'No token provided.' })
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match.' })
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string)

    const userIdFromToken = decoded.email || decoded.userId

    if (!userIdFromToken) {
      return res
        .status(400)
        .json({ message: 'Invalid token or user mismatch.' })
    }

    await forgotPasswordService.setNewPassword(userIdFromToken, newPassword)

    res.status(200).json({ message: 'Password updated successfully.' })
  } catch (error: any) {
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError'
    ) {
      return res.status(401).json({ message: 'Invalid or expired token.' })
    }

    res.status(500).json({ message: 'Internal server error' })
  }
}
