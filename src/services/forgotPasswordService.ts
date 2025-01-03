import crypto from 'crypto'
import User from '../models/user.model'
import bcrypt from 'bcryptjs'

import { sendEmail } from '../utils/forgotPasswordEmail'

export const forgotPasswordService = {
  requestReset: async (email: string) => {
    const user = await User.findOne({ email })

    if (!user) {
      throw new Error('Email not found.')
    }

    const otp = crypto.randomInt(100000, 999999).toString()

    user.resetOTP = otp
    user.otpExpires = new Date(Date.now() + 2 * 60 * 1000)

    await user.save()

    await sendEmail(
      user.email,
      'Password Reset OTP',
      `Your OTP for password reset is: ${otp}. It will expire in 2 minutes.`
    )
  },

  verifyOTP: async (email: string, otp: string): Promise<boolean> => {
    const user = await User.findOne({ email, resetOTP: otp })

    if (!user) {
      console.log('No user found with this OTP.')
      return false // Invalid OTP
    }

    console.log('OTP expires at:', user.otpExpires)
    console.log('Current time:', new Date())

    // Check if OTP has expired
    if (user.otpExpires && user.otpExpires.getTime() < new Date().getTime()) {
      console.log('OTP has expired.')
      return false // OTP expired
    }

    // OTP is valid; clear OTP and expiration time
    user.resetOTP = undefined
    user.otpExpires = undefined
    await user.save()

    console.log('OTP verified successfully.')
    return true // OTP verified successfully
  },

  resendOTP: async (email: string) => {
    const user = await User.findOne({ email })

    if (!user) {
      throw new Error('Email not found.')
    }

    const otp = crypto.randomInt(100000, 999999).toString()

    user.resetOTP = otp
    user.otpExpires = new Date(Date.now() + 2 * 60 * 1000)

    await user.save()

    await sendEmail(
      user.email,
      'Password Reset OTP',
      `Your new OTP for password reset is: ${otp}. It will expire in 2 minutes.`
    )
  },

  setNewPassword: async (email: string, newPassword: string) => {
    const user = await User.findOne({ email })

    if (!user) throw new Error('User not found.')

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    user.password = hashedPassword
    user.resetOTP = undefined
    user.otpExpires = undefined

    const updatedUser = await user.save()
    if (!updatedUser) {
      throw new Error('Password update failed.')
    }

    await sendEmail(
      user.email,
      'Your Password Has Been Updated',
      'Your password has been successfully updated.'
    )
  }
}
