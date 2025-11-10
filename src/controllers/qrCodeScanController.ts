import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { handleQRCodeScan } from "../services/qrCodeScanService";

// export const scanQRCode = async (req: Request, res: Response): Promise<any> => {
//   try {
//     const token = req.header('Authorization')?.replace('Bearer ', '');
//     if (!token) {
//       return res.status(401).json({ message: 'Authorization token required' });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
//     const userId = decoded.userId;

//     const { scannedCode } = req.body;
//     if (!scannedCode) {
//       return res.status(400).json({ message: 'Scanned code is required' });
//     }

//     const {
//       updatedUser,
//       userHistory,
//       scannedQRCode,
//     } = await handleQRCodeScan(userId, scannedCode);

//     return res.status(200).json({
//       message: 'QR Code scanned successfully. Points added to your account.',
//       userId: updatedUser._id,
//       userPoints: updatedUser.brandPoints,
//       userName: updatedUser.name,
//       userHistory,
//       scannedQRCode, // includes code, points, and brand if available
//     });
//   } catch (error: any) {
//     console.error('Error in QR code scan:', error.message);
//     return res.status(500).json({
//       message: 'Server error while scanning QR code. Please try again later.',
//       error: error instanceof Error ? error.message : 'Unknown error',
//     });
//   }
// };

export const scanQRCode = async (req: Request, res: Response): Promise<any> => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Authorization token required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    const userId = decoded.userId;

    const { scannedCode } = req.body;
    if (!scannedCode) {
      return res.status(400).json({ message: "Scanned code is required" });
    }

    const { updatedUser, userHistory, scannedQRCode } = await handleQRCodeScan(
      userId,
      scannedCode
    );

    return res.status(200).json({
      message: "QR Code scanned successfully. Points added to your account.",
      userId: updatedUser._id,
      userPoints: updatedUser.brandPoints,
      userName: updatedUser.name,
      userHistory,
      scannedQRCode, // includes code, points, and brand
    });
  } catch (error: any) {

    // 🔥 Distinguish between error types
    if (error.message === "QR Code not found") {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === "QR Code has already been used. Please scan a new code") {
      return res.status(409).json({ message: error.message });
    }
    if (error.message === "QR Code already scanned by this user") {
      return res.status(409).json({ message: error.message });
    }
    if (error.message === "User not found") {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === "QR Code is not associated with a valid brand") {
      return res.status(400).json({ message: error.message });
    }

    // Default fallback → internal error
    return res.status(500).json({
      message: "Server error while scanning QR code. Please try again later.",
      error: error.message,
    });
  }
};
