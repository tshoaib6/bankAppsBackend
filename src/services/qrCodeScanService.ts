import QRCode from '../models/QRCode.model';
import User from '../models/user.model';
import UserHistory from '../models/userHistory.model';
import mongoose from 'mongoose';

export const handleQRCodeScan = async (userId: string, scannedCode: string) => {
  // Since brand is now a simple string, no need to populate
  const qrCodeDoc = await QRCode.findOne({ code: scannedCode });
  const qrCode = qrCodeDoc as (any & { _id: mongoose.Types.ObjectId });

  if (!qrCode) {
    throw new Error('QR Code not found');
  }

  // Check if the QR code is marked as used system-wide
  if (qrCode.isUsed) {
    throw new Error('QR Code has already been used');
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  // Prevent user from scanning same QR multiple times
  if (user.scanned_qr_codes.includes(qrCode._id.toString())) {
    throw new Error('QR Code already scanned by this user');
  }

  const pointsEarned = qrCode.points;

  // Add scanned QR code to user history
  user.scanned_qr_codes.push(qrCode._id.toString());

  // brand is just a string now
  const brandName = qrCode.brand || null;

  if (!brandName) {
    throw new Error('QR Code is not associated with a valid brand');
  }

  // Add or update points in user.brandPoints (now based on brand name string)
  const existingBrandEntry = user.brandPoints.find(
    (entry) => entry.brand === brandName
  );

  if (existingBrandEntry) {
    existingBrandEntry.points += pointsEarned;
  } else {
    user.brandPoints.push({ brand: brandName, points: pointsEarned });
  }

  await user.save();

  // Log to user history
  const userHistory = new UserHistory({
    user_id: userId,
    points_earned: pointsEarned,
    qrCode: scannedCode,
    brand: brandName,
    points_used: 0,
    reference_id: '',
    type: 'QRCodeScan',
  });

  await userHistory.save();

  // Mark QR as used globally
  qrCode.isUsed = true;
  await qrCode.save();

  return {
    updatedUser: {
      _id: user._id,
      name: user.name,
      brandPoints: user.brandPoints,
    },
    userHistory,
    scannedQRCode: {
      code: qrCode.code,
      brand: brandName,   // ✅ simple string
      points: qrCode.points,
    },
  };
};
