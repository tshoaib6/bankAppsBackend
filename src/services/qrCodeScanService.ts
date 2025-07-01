import QRCode from '../models/QRCode.model';
import User from '../models/user.model';
import UserHistory from '../models/userHistory.model';
import { IBrand } from '../models/brand.model';
import { IQRCode } from '../models/QRCode.model';
import mongoose from 'mongoose';

function isBrandPopulated(brand: any): brand is IBrand {
  return brand && typeof brand === 'object' && 'brandName' in brand;
}

export const handleQRCodeScan = async (userId: string, scannedCode: string) => {
  const qrCodeDoc = await QRCode.findOne({ code: scannedCode }).populate('brand');
  const qrCode = qrCodeDoc as (IQRCode & { _id: mongoose.Types.ObjectId });

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

  const brandId = (qrCode.brand instanceof mongoose.Types.ObjectId)
    ? qrCode.brand
    : (qrCode.brand && '_id' in qrCode.brand ? (qrCode.brand._id as mongoose.Types.ObjectId) : null);

  if (!brandId) {
    throw new Error('QR Code is not associated with a valid brand');
  }

  // Add or update points in user.brandPoints
  const existingBrandEntry = user.brandPoints.find(
    (entry) => entry.brand.toString() === brandId.toString()
  );

  if (existingBrandEntry) {
    existingBrandEntry.points += pointsEarned;
  } else {
    user.brandPoints.push({ brand: brandId, points: pointsEarned });
  }

  await user.save();

  // Log to user history
  const userHistory = new UserHistory({
    user_id: userId,
    points_earned: pointsEarned,
    qrCode: scannedCode,
    brand: brandId,
    points_used: 0,
    reference_id: '',
    type: 'QRCodeScan',
  });

  await userHistory.save();

  // Mark QR as used globally
  qrCode.isUsed = true;
  await qrCode.save();

  // Prepare populated brand details
  const populatedBrand = isBrandPopulated(qrCode.brand)
    ? {
        _id: qrCode.brand._id,
        brandName: qrCode.brand.brandName,
        description: qrCode.brand.description,
        logo: qrCode.brand.logo,
      }
    : null;

  return {
    updatedUser: {
      _id: user._id,
      name: user.name,
      brandPoints: user.brandPoints,
    },
    userHistory,
    scannedQRCode: {
      code: qrCode.code,
      brand: populatedBrand,
      points: qrCode.points,
    },
  };
};
