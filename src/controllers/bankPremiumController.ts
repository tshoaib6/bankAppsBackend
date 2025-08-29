import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import BankPremiumService, {
  getAllRedemptionsService,
} from "../services/bankPremiumService";
import { uploadToCloudinary } from "../utils/cloudinary";


interface RedeemRequestBody {
  premiumId: string;
}

interface DecodedToken extends JwtPayload {
  userId: string;
  email: string;
  username: string;
  userRole: string;
}

/**
 * Create a new BankPremium
 */
export const createBankPremium = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token)
      return res.status(401).json({ message: "Authorization token required" });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.userId;

    const {
      title,
      description,
      points_required,
      start_date,
      end_date,
      active,
      brand,
    } = req.body;

    if (!req.file)
      return res.status(400).json({ message: "Image is required" });

    const imageUrl = await uploadToCloudinary(
      req.file.buffer,
      "bankpremium_images"
    );

    const bankPremiumData = {
      title,
      description,
      points_required,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      image_url: imageUrl,
      active: active ?? true,
      enrolled_users: [],
      brand: brand || null,
    };

    const newBankPremium = await BankPremiumService.createBankPremium(
      userId,
      bankPremiumData
    );

    return res.status(201).json({
      message: "BankPremium created successfully",
      bankPremium: newBankPremium,
    });
  } catch (error: any) {
    console.error("Error creating BankPremium:", error);
    return res.status(500).json({
      message: "An error occurred while creating BankPremium",
      error: error.message,
    });
  }
};

/**
 * Update an existing BankPremium
 */
export const updateBankPremium = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { bankPremiumId } = req.params;
    const updates = req.body;

    if (req.file) {
      const imageUrl = await uploadToCloudinary(
        req.file.buffer,
        "bankpremium_images"
      );
      updates.image_url = imageUrl;
    }

    const updatedBankPremium = await BankPremiumService.updateBankPremium(
      bankPremiumId,
      updates
    );

    return res.status(200).json({
      message: "BankPremium updated successfully",
      bankPremium: updatedBankPremium,
    });
  } catch (error: any) {
    console.error("Error updating BankPremium:", error);
    return res.status(500).json({
      message: "An error occurred while updating BankPremium",
      error: error.message,
    });
  }
};

/**
 * Delete a BankPremium
 */
export const deleteBankPremium = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { bankPremiumId } = req.params;
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token)
      return res.status(401).json({ message: "Authorization token required" });

    jwt.verify(token, process.env.JWT_SECRET!);

    const bankPremium = await BankPremiumService.deleteBankPremium(
      bankPremiumId
    );

    if (!bankPremium) {
      return res.status(404).json({ message: "BankPremium not found" });
    }

    return res.status(200).json({
      message: "BankPremium deleted successfully",
      bankPremium,
    });
  } catch (error: any) {
    console.error("Error deleting BankPremium:", error);
    return res.status(500).json({
      message: "An error occurred while deleting BankPremium",
      error: error.message,
    });
  }
};

/**
 * Get all BankPremiums
 */
export const getAllBankPremiums = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const bankPremiums = await BankPremiumService.getAllBankPremiums();

    if (!bankPremiums || bankPremiums.length === 0) {
      return res.status(404).json({ message: "No BankPremiums found" });
    }

    return res.status(200).json({
      message: "BankPremiums fetched successfully",
      bankPremiums,
    });
  } catch (error: any) {
    console.error("Error fetching BankPremiums:", error);
    return res.status(500).json({
      message: "An error occurred while fetching BankPremiums",
      error: error.message,
    });
  }
};

/**
 * Get a BankPremium by ID
 */
export const getBankPremiumById = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { bankPremiumId } = req.params;
    const bankPremium = await BankPremiumService.getBankPremiumById(
      bankPremiumId
    );

    if (!bankPremium) {
      return res.status(404).json({ message: "BankPremium not found" });
    }

    return res.status(200).json({
      message: "BankPremium fetched successfully",
      bankPremium,
    });
  } catch (error: any) {
    console.error("Error fetching BankPremium:", error);
    return res.status(500).json({
      message: "An error occurred while fetching BankPremium",
      error: error.message,
    });
  }
};

/**
 * Redeem a BankPremium (User)
 */
export const redeemBankPremium = async (
  req: Request<{}, {}, RedeemRequestBody>,
  res: Response
): Promise<Response> => {
  try {
    // 🔹 Extract and verify token
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Authorization token required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    const userId = decoded.userId;

    // 🔹 Validate request body
    const { premiumId } = req.body;
    if (!premiumId) {
      return res.status(400).json({ message: "premiumId is required" });
    }

    // 🔹 Call service
    const result = await BankPremiumService.redeemBankPremiumService(
      userId,
      premiumId
    );

    // 🔹 Return success response
    return res.status(200).json({
      message: "BankPremium redeemed successfully",
      ...result,
    });
  } catch (error: any) {
    console.error("Error redeeming BankPremium:", error);

    // 🔹 Known validation/user errors
    const knownErrors = [
      "  cient points",
      "not found",
      "Invalid",
      "required",
    ];

    if (knownErrors.some((msg) => error.message.includes(msg))) {
      return res.status(400).json({ message: error.message });
    }

    // 🔹 Unknown/internal error
    return res.status(500).json({
      message: "An error occurred while redeeming BankPremium",
      error: error.message,
    });
  }
};

/**
 * Verify redemption code (Admin) → Mark as delivered
 */
export const verifyBankPremiumCode = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { code } = req.body;

    if (!code) {
      return res
        .status(400)
        .json({ success: false, message: "Code is required" });
    }

    const result = await BankPremiumService.verifyBankPremiumCodeService(code);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Error verifying BankPremium code:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "An error occurred while verifying code",
    });
  }
};

export const getAllRedemptionsController = async (
  req: Request,
  res: Response
) => {
  try {
    const redemptions = await getAllRedemptionsService();
    res.status(200).json({ success: true, data: redemptions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  createBankPremium,
  updateBankPremium,
  deleteBankPremium,
  getAllBankPremiums,
  getBankPremiumById,
  redeemBankPremium,
  verifyBankPremiumCode,
  getAllRedemptionsService,
};
