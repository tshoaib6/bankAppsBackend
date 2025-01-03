import QRCode from '../models/QRCode.model'
import User from '../models/user.model'
import UserHistory from '../models/userHistory.model'

export const handleQRCodeScan = async (userId: string, scannedCode: string) => {
  const qrCode = await QRCode.findOne({ code: scannedCode })
  if (!qrCode) {
    throw new Error('QR Code not found')
  }

  if (qrCode.isUsed) {
    throw new Error('QR Code has already been used')
  }

  const user = await User.findById(userId)
  if (!user) {
    throw new Error('User not found')
  }

  const pointsEarned = qrCode.points

  user.points += pointsEarned
  await user.save()

  const userHistory = new UserHistory({
    user_id: userId,
    points_earned: pointsEarned,
    qrCode: scannedCode,
    points_used: 0,
    reference_id: '',
    type: 'QRCodeScan'
  })

  await userHistory.save()

  qrCode.isUsed = true
  await qrCode.save()

  return {
    updatedUser: user,
    userHistory: userHistory
  }
}
