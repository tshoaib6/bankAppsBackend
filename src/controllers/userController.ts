  import { Request, Response } from "express";
  import {
    registerUser,
    loginUserService,
    getAllUsers,
    updateUserStatusService,
    deleteUserService,
    verifyEmailService,
    // notifyUsersByAddress,
    getUsersByAddress,
    exportUsersToCSVService,
    sendForgotPasswordOTPService,
    resendForgotPasswordOTPService,
    verifyForgotPasswordOTPService,
    resetPasswordWithOTPService,
  } from "../services/userService";
  import {
    validateEmail,
    validateName,
    validatePassword,
    // validatePassword,
  } from "../utils/validators";
  import jwt from "jsonwebtoken";
  import User from "../models/user.model";

  // 🚀 Register User (no brand attached at registration)
export const register = async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      name,
      email,
      password,
      date_of_birth,
      is_over_18,
      address,
      parish,
      userRole,
    } = req.body;
    if (!validateEmail(email))
      return res.status(400).json({ message: "Invalid email" });
    if (!parish || typeof parish !== "string")
      return res.status(400).json({ message: "Parish is required" });
    const newUser = await registerUser(
      name,
      email,
      password,
      date_of_birth,
      is_over_18,
      address || undefined,
      parish,
      userRole || "user"
    );
    res.status(201).json({
      message:
        "User registered successfully. Please check your email to verify your account.",
      user: newUser,
    });
  } catch (error: any) {
    console.error("Error in user registration:", error);
    // :white_check_mark: Return the actual error message
    return res.status(400).json({
      message: error.message || "Something went wrong, please try again",
    });
  }
};













  // 🔐 Login User
  export const login = async (req: Request, res: Response): Promise<any> => {
    try {
      const { email, password } = req.body;
      if (!validateEmail(email))
        return res.status(400).json({ message: "Invalid email" });
      // if (!validatePassword(password))
      //   return res.status(400).json({
      //     message: "Password must be at least 6 characters",
      //   });
      const user = await loginUserService(email, password);
      if (!user) return res.status(401).json({ message: "Invalid credentials" });
      if (!user.isVerified) {
        return res
          .status(401)
          .json({ message: "Please verify your email to log in." });
      }
      // Extract brand IDs from brandPoints array
      const brandIds = user.brandPoints.map((bp) => bp.brand);
      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          username: user.name,
          userRole: user.userRole, // <--- added here
          brands: brandIds, // :white_check_mark: now using brandPoints for brand list
        },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "30d" }
      );
      const totalPoints = user.brandPoints.reduce(
        (sum, bp) => sum + bp.points,
        0
      );
      res.status(200).json({
        message: "Login successful",
        token,
        user: {
          name: user.name,
          email: user.email,
          points: user.brandPoints,
          brands: brandIds,
          address: user.address,
          userRole: user.userRole,
          _id: user._id,
        },
      });
    } catch (error: any) {
      console.error("Error in user login:", error.message);
      // If it's an authentication error, return 401 with the real message
      if (
        error.message === "Invalid email or password" ||
        error.message === "Email is not verified"
      ) {
        return res.status(401).json({ message: error.message });
      }
      // Otherwise, default to 500
      res.status(500).json({ message: "Server error, please try again" });
    }
  };
















  // 👥 Get All Users (optionally by brand)
  export const getUsers = async (req: Request, res: Response): Promise<any> => {
    try {
      const { brandId, search } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const { users, totalCount, totalPages, currentPage } = await getAllUsers(
        page,
        limit,
        brandId as string,
        search as string // pass search term to service
      );

      // ✅ Always return 200, even if no users found
      const usersWithFilteredBrands = brandId
        ? users.map((user) => ({
            ...user.toObject(),
            brandPoints: user.brandPoints.filter(
              (bp) => bp.brand.toString() === brandId
            ),
          }))
        : users;

      return res.status(200).json({
        users: usersWithFilteredBrands || [],
        totalCount: totalCount || 0,
        totalPages: totalPages || 0,
        currentPage: currentPage || page,
        message:
          users.length === 0 ? "No users found" : "Users fetched successfully",
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      return res
        .status(500)
        .json({ message: "Server error, please try again" });
    }
  };



  // 🔄 Update Active/Blocked Status
  export const updateUserStatus = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    try {
      const { userId } = req.params;
      const { isActive } = req.body;

      if (typeof isActive !== "boolean")
        return res.status(400).json({
          message: "Invalid status value. It must be a boolean.",
        });

      const updatedUser = await updateUserStatusService(userId, isActive);
      if (!updatedUser)
        return res.status(404).json({ message: "User not found" });

      res.status(200).json({
        message: isActive
          ? "User has been unblocked successfully"
          : "User has been blocked successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Error updating user status:", error);
      res.status(500).json({
        message: "Failed to update user status. Please try again later.",
      });
    }
  };

  // 🗑️ Delete User
  export const deleteUser = async (req: Request, res: Response): Promise<any> => {
    try {
      const { userId } = req.params;
      const deletedUser = await deleteUserService(userId);
      if (!deletedUser)
        return res.status(404).json({ message: "User not found" });

      res
        .status(200)
        .json({ message: "User deleted successfully", user: deletedUser });
    } catch (error) {
      console.error("Error deleting user:", error);
      res
        .status(500)
        .json({ message: "Failed to delete user. Please try again later." });
    }
  };

  // ✅ Verify Email
  export const verifyEmail = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    try {
      const { token } = req.params;
      const verifiedUser = await verifyEmailService(token);
      if (!verifiedUser)
        return res
          .status(400)
          .json({ message: "Invalid or expired verification token." });

      res.status(200).json({
        message: "Email verified successfully!",
        user: verifiedUser,
      });
    } catch (error) {
      console.error("Error verifying email:", error);
      res
        .status(500)
        .json({ message: "Failed to verify email. Please try again later." });
    }
  };


  export const getUsersByAddressController = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    try {
      const { address } = req.query;

      if (!address) {
        return res.status(400).json({ error: "Address is required." });
      }

      const users = await getUsersByAddress(address as string);

      res.status(200).json({
        message: "Users retrieved successfully",
        count: users.length,
        users,
      });
    } catch (error) {
      console.error("Error in getUsersByAddressController:", error);
      res.status(500).json({ error: "Failed to retrieve users by address" });
    }
  };

  export const updateFcmToken = async (req: Request, res: Response) => {
    const { userId } = req.params; // Get from URL params
    const { fcmToken, address } = req.body; // Get from body
    try {
      const updateData: any = { fcmToken };
      if (address) {
        updateData.address = address; // ✅ only set if passed
      }
      await User.findByIdAndUpdate(userId, updateData);
      res.status(200).json({ message: "FCM token updated" });
    } catch (err) {
      res.status(500).json({ error: "Failed to update FCM token" });
    }
  };
  export const exportUsersToCSVController = async (req: Request, res: Response) => {
    try {
      const csv = await exportUsersToCSVService();

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=users.csv");
      res.status(200).end(csv);
    } catch (error: any) {
      console.error("Error exporting users to CSV:", error);
      res.status(500).json({ message: error.message || "Error exporting users" });
    }
  };


/**
 * 📩 Send OTP for password reset
 */
export const sendForgotPasswordOTP = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const msg = await sendForgotPasswordOTPService(email);
    res.status(200).json({ message: msg });
  } catch (error: any) {
    console.error("Error in sendForgotPasswordOTP:", error);
    res.status(500).json({ message: error.message || "Failed to send OTP" });
  }
};

/**
 * 🔄 Resend OTP for password reset
 */
export const resendForgotPasswordOTP = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const msg = await resendForgotPasswordOTPService(email);
    res.status(200).json({ message: msg });
  } catch (error: any) {
    console.error("Error in resendForgotPasswordOTP:", error);
    res.status(500).json({ message: error.message || "Failed to resend OTP" });
  }
};

/**
 * ✅ Verify OTP (Step 2 of flow)
 */
export const verifyForgotPasswordOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const msg = await verifyForgotPasswordOTPService(email, otp);

    return res.status(200).json({ message: msg });
  } catch (error: any) {
    console.error("Error in verifyForgotPasswordOTP:", error);
    res.status(500).json({ message: error.message || "Failed to verify OTP" });
  }
};

/**
 * 🔐 Reset password (Step 3 of flow)
 * OTP is already verified in previous step, so no need to re-check
 */
export const resetPasswordWithOTP = async (req: Request, res: Response) => {
  console.log("📩 Incoming request to resetPasswordWithOTP");
  console.log("👉 Request body:", req.body);

  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      console.warn("⚠️ Missing email or newPassword in request");
      return res
        .status(400)
        .json({ message: "Email and new password are required" });
    }

    const msg = await resetPasswordWithOTPService(email, newPassword);

    console.log("✅ Password reset successful for user:", email);

    return res.status(200).json({ message: msg });
  } catch (error: any) {
    console.error("❌ Error in resetPasswordWithOTP controller");
    console.error("📛 Error details:", error);

    return res
      .status(500)
      .json({ message: error.message || "Failed to reset password" });
  }
};

