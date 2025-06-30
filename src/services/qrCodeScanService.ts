import QRCode from '../models/QRCode.model';
import User from '../models/user.model';
import UserHistory from '../models/userHistory.model';
import { IBrand } from '../models/brand.model'; 

function isBrandPopulated(brand: any): brand is IBrand {
  return brand && typeof brand === 'object' && 'brandName' in brand;
}

export const handleQRCodeScan = async (userId: string, scannedCode: string) => {
  const qrCode = await QRCode.findOne({ code: scannedCode }).populate('brand');
  if (!qrCode) {
    throw new Error('QR Code not found');
  }

  if (qrCode.isUsed) {
    throw new Error('QR Code has already been used');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const pointsEarned = qrCode.points;
  user.points += pointsEarned;
  await user.save();

  const userHistory = new UserHistory({
    user_id: userId,
    points_earned: pointsEarned,
    qrCode: scannedCode,
    brand: isBrandPopulated(qrCode.brand) ? qrCode.brand._id : null,
    points_used: 0,
    reference_id: '',
    type: 'QRCodeScan',
  });

  await userHistory.save();

  qrCode.isUsed = true;
  await qrCode.save();

  const populatedBrand = isBrandPopulated(qrCode.brand)
    ? {
        _id: qrCode.brand._id,
        brandName: qrCode.brand.brandName,
        description: qrCode.brand.description,
        logo: qrCode.brand.logo,
      }
    : null;

  return {
    updatedUser: user,
    userHistory,
    scannedQRCode: {
      code: qrCode.code,
      brand: populatedBrand,
      points: qrCode.points,
    },
  };
};
