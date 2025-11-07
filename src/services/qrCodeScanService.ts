import QRCode from '../models/QRCode.model';
import User from '../models/user.model';
import UserHistory from '../models/userHistory.model';
import mongoose from 'mongoose';


export const handleQRCodeScan = async (userId: string, scannedCode: string) => {
  try {
    console.log("📌 handleQRCodeScan called with:", { userId, scannedCode });

    // Find QR code
    const qrCodeDoc = await QRCode.findOne({ code: scannedCode });
    console.log("🔍 QRCode.findOne result:", qrCodeDoc);

    const qrCode = qrCodeDoc as (any & { _id: mongoose.Types.ObjectId });

    if (!qrCode) {
      console.error("❌ QR Code not found");
      throw new Error("QR Code not found");
    }

    // Check if QR already used
    if (qrCode.isUsed) {
      console.error("❌ QR Code already used:", qrCode);
      throw new Error("QR Code has already been used. Please scan a new code");
    }

    // Find user
    const user = await User.findById(userId);
    console.log("👤 User found:", user);

    if (!user) {
      console.error("❌ User not found for ID:", userId);
      throw new Error("User not found");
    }

    // Prevent scanning same QR multiple times
    console.log("🔎 Checking if user already scanned this QR...");
    console.log("User scanned_qr_codes:", user.scanned_qr_codes);
    if (user.scanned_qr_codes.includes(qrCode._id.toString())) {
      console.error("QR Code already scanned by this user:", qrCode._id);
      throw new Error("QR Code has already been used. Please scan a new code");
    }

    const pointsEarned = qrCode.points;
    console.log("⭐ Points earned from QR:", pointsEarned);

    // Add scanned QR to user history
    user.scanned_qr_codes.push(qrCode._id.toString());
    console.log("📥 Updated scanned_qr_codes:", user.scanned_qr_codes);

    // 🏷️ Resolve brand (always store ObjectId, return string)
    const BANKS_BRAND_ID = new mongoose.Types.ObjectId("68ad2f87cfdd5f2ad515f188");

    let brandId: mongoose.Types.ObjectId;
    let brandName: string;

    if (!qrCode.brand) {
      brandId = BANKS_BRAND_ID;
      brandName = "Banks";
    } else if (qrCode.brand.toString() === BANKS_BRAND_ID.toString()) {
      brandId = BANKS_BRAND_ID;
      brandName = "Banks";
    } else if (qrCode.brand === "Banks") {
      brandId = BANKS_BRAND_ID;
      brandName = "Banks";
    } else {
      // Any other case (future brands)
      brandId = new mongoose.Types.ObjectId(qrCode.brand);
      brandName = qrCode.brand.toString();
    }

    console.log("🏷️ Brand resolved:", { brandId, brandName });

    // Update user.brandPoints
    const existingBrandEntry = user.brandPoints.find(
      (entry) => entry.brand.toString() === brandId.toString()
    );

    if (existingBrandEntry) {
      existingBrandEntry.points += pointsEarned;
      console.log("📈 Updated brand points:", existingBrandEntry);
    } else {
      user.brandPoints.push({ brand: brandId, points: pointsEarned });
      console.log("🆕 Added new brand entry:", { brand: brandId, points: pointsEarned });
    }

    await user.save();
    console.log("✅ User saved successfully:", {
      userId: user._id,
      brandPoints: user.brandPoints,
    });

    // Log to user history
    const userHistory = new UserHistory({
      user_id: userId,
      points_earned: pointsEarned,
      qrCode: scannedCode,
      brand: brandName, // keep string for history readability
      points_used: 0,
      reference_id: "",
      type: "QRCodeScan",
    });

    await userHistory.save();
    console.log("📝 User history saved:", userHistory);

    // Mark QR as used globally
    qrCode.isUsed = true;
    await qrCode.save();
    console.log("✅ QR code marked as used and saved:", qrCode);

    // Final return
    const result = {
      updatedUser: {
        _id: user._id,
        name: user.name,
        brandPoints: user.brandPoints,
      },
      userHistory,
      scannedQRCode: {
        code: qrCode.code,
        brand: brandName,
        points: qrCode.points,
      },
    };

    console.log("🎉 Final result:", result);
    return result;
  } catch (error) {
    console.error("🔥 Error in handleQRCodeScan:", error);
    throw error; // rethrow for API error handling
  }
};
