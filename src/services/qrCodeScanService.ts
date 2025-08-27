import QRCode from '../models/QRCode.model';
import User from '../models/user.model';
import UserHistory from '../models/userHistory.model';
import mongoose from 'mongoose';

// export const handleQRCodeScan = async (userId: string, scannedCode: string) => {
//   try {
//     console.log("📌 handleQRCodeScan called with:", { userId, scannedCode });

//     // Find QR code
//     const qrCodeDoc = await QRCode.findOne({ code: scannedCode });
//     console.log("🔍 QRCode.findOne result:", qrCodeDoc);

//     const qrCode = qrCodeDoc as (any & { _id: mongoose.Types.ObjectId });

//     if (!qrCode) {
//       console.error("❌ QR Code not found");
//       throw new Error("QR Code not found");
//     }

//     // Check if QR already used
//     if (qrCode.isUsed) {
//       console.error("❌ QR Code already used:", qrCode);
//       throw new Error("QR Code has already been used");
//     }

//     // Find user
//     const user = await User.findById(userId);
//     console.log("👤 User found:", user);

//     if (!user) {
//       console.error("❌ User not found for ID:", userId);
//       throw new Error("User not found");
//     }

//     // Prevent scanning same QR multiple times
//     console.log("🔎 Checking if user already scanned this QR...");
//     console.log("User scanned_qr_codes:", user.scanned_qr_codes);
//     if (user.scanned_qr_codes.includes(qrCode._id.toString())) {
//       console.error("❌ QR Code already scanned by this user:", qrCode._id);
//       throw new Error("QR Code already scanned by this user");
//     }

//     const pointsEarned = qrCode.points;
//     console.log("⭐ Points earned from QR:", pointsEarned);

//     // Add scanned QR to user history
//     user.scanned_qr_codes.push(qrCode._id.toString());
//     console.log("📥 Updated scanned_qr_codes:", user.scanned_qr_codes);

//     // Get brand
//     const brandName = qrCode.brand || null;
//     console.log("🏷️ Brand from QR:", brandName);

//     if (!brandName) {
//       console.error("❌ No brand associated with QR code");
//       throw new Error("QR Code is not associated with a valid brand");
//     }

//     // Update user.brandPoints
//     const existingBrandEntry = user.brandPoints.find(
//       (entry) => entry.brand === brandName
//     );
//     console.log("🔎 Existing brand entry in user.brandPoints:", existingBrandEntry);

//     if (existingBrandEntry) {
//       existingBrandEntry.points += pointsEarned;
//       console.log("📈 Updated brand points:", existingBrandEntry);
//     } else {
//       user.brandPoints.push({ brand: brandName, points: pointsEarned });
//       console.log("🆕 Added new brand entry:", { brand: brandName, points: pointsEarned });
//     }

//     await user.save();
//     console.log("✅ User saved successfully:", {
//       userId: user._id,
//       brandPoints: user.brandPoints,
//     });

//     // Log to user history
//     const userHistory = new UserHistory({
//       user_id: userId,
//       points_earned: pointsEarned,
//       qrCode: scannedCode,
//       brand: brandName,
//       points_used: 0,
//       reference_id: "",
//       type: "QRCodeScan",
//     });

//     await userHistory.save();
//     console.log("📝 User history saved:", userHistory);

//     // Mark QR as used globally
//     qrCode.isUsed = true;
//     await qrCode.save();
//     console.log("✅ QR code marked as used and saved:", qrCode);

//     // Final return
//     const result = {
//       updatedUser: {
//         _id: user._id,
//         name: user.name,
//         brandPoints: user.brandPoints,
//       },
//       userHistory,
//       scannedQRCode: {
//         code: qrCode.code,
//         brand: brandName,
//         points: qrCode.points,
//       },
//     };

//     console.log("🎉 Final result:", result);
//     return result;
//   } catch (error) {
//     console.error("🔥 Error in handleQRCodeScan:", error);
//     throw error; // rethrow for API error handling
//   }
// };






// made brandId optional

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
      throw new Error("QR Code has already been used");
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
      console.error("❌ QR Code already scanned by this user:", qrCode._id);
      throw new Error("QR Code already scanned by this user");
    }

    const pointsEarned = qrCode.points;
    console.log("⭐ Points earned from QR:", pointsEarned);

    // Add scanned QR to user history
    user.scanned_qr_codes.push(qrCode._id.toString());
    console.log("📥 Updated scanned_qr_codes:", user.scanned_qr_codes);

    // Use default brand if none exists
    const brandName = qrCode.brand || "Banks";
    console.log("🏷️ Brand from QR (default applied if missing):", brandName);

    // Update user.brandPoints
    const existingBrandEntry = user.brandPoints.find(
      (entry) => entry.brand === brandName
    );

    if (existingBrandEntry) {
      existingBrandEntry.points += pointsEarned;
      console.log("📈 Updated brand points:", existingBrandEntry);
    } else {
      user.brandPoints.push({ brand: brandName, points: pointsEarned });
      console.log("🆕 Added new brand entry:", { brand: brandName, points: pointsEarned });
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
      brand: brandName,
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


