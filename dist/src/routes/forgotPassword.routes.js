"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const forgotPasswordController_1 = require("../controllers/forgotPasswordController");
const router = (0, express_1.Router)();
router.post('/forgot-password', forgotPasswordController_1.requestPasswordReset);
router.post('/verify-otp', forgotPasswordController_1.verifyOTP);
router.post('/resend-otp', forgotPasswordController_1.resendOTP);
router.post('/set-new-password', forgotPasswordController_1.setNewPassword); // Apply authMiddleware here
exports.default = router;
