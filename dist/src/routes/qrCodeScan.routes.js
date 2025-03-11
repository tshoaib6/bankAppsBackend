"use strict";
// routes/qrCodeRoutes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const qrCodeScanController_1 = require("../controllers/qrCodeScanController");
const router = (0, express_1.Router)();
router.post('/scan', qrCodeScanController_1.scanQRCode);
exports.default = router;
