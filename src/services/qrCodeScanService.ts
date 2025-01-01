// services/qrCodeService.ts

import QRCode from '../models/QRCode.model';
import User from '../models/user.model';
import UserHistory from '../models/userHistory.model';

export const handleQRCodeScan = async (userId: string, scannedCode: string) => {
  // Check if QR Code exists in the database
  const qrCode = await QRCode.findOne({ code: scannedCode });
  if (!qrCode) {
    throw new Error('QR Code not found');
  }

  // Check if the QR Code has already been used
  if (qrCode.isUsed) {
    throw new Error('QR Code has already been used');
  }

  // Find the user and update their points
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Points earned from the QR code
  const pointsEarned = qrCode.points;

  // Add points from the QR Code to the user's existing points
  user.points += pointsEarned;
  await user.save();

  // Create a new user history entry for this QR Code scan
  const userHistory = new UserHistory({
    user_id: userId,  // Reference to the user
    points_earned: pointsEarned,  // Points earned from this QR code
    qrCode: scannedCode,  // The QR code scanned
    points_used: 0, // Assuming no points are used, you can modify this if needed
    reference_id: "", // Reference ID if needed (e.g., transaction ID)
    type: "QRCodeScan", // Reference ID if needed (e.g., transaction ID)

  });

  // Save the user history entry
  await userHistory.save();

  // Mark the QR code as used
  qrCode.isUsed = true;
  await qrCode.save();

  // Return the updated user data and the new user history entry
  return {
    updatedUser: user,
    userHistory: userHistory,
  };
};
