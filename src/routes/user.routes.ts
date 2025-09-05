import { Router, Request, Response } from "express";
import {
  register,
  login,
  getUsers,
  updateUserStatus,
  deleteUser,
  verifyEmail,
  updateFcmToken,
  getUsersByAddressController,
  exportUsersToCSVController,
  sendForgotPasswordOTP,
  resendForgotPasswordOTP,
  verifyForgotPasswordOTP,
  resetPasswordWithOTP,
} from "../controllers/userController";

const router = Router();

router.post("/register", register);

router.post("/login", login);

router.get("/getAllUsers", getUsers);

router.put("/user/:userId/status", updateUserStatus);

router.delete("/user/:userId", deleteUser);

router.get("/verify-email/:token", verifyEmail);

router.get("/get-all-users-by-address", getUsersByAddressController);

router.put("/user/:userId/fcm-token", updateFcmToken);
router.get("/export-users-csv", exportUsersToCSVController);

router.post("/forgot-password", sendForgotPasswordOTP);
router.post("/resend-otp", resendForgotPasswordOTP);
//optional
router.post("/verify-otp", verifyForgotPasswordOTP);
router.post("/reset-password", resetPasswordWithOTP);

export default router;
