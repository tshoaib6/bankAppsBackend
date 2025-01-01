// routes/qrCodeRoutes.ts

import { Router } from 'express';
import  {scanQRCode}  from '../controllers/qrCodeScanController';

const router = Router();

// Route for scanning QR code
router.post('/scan', scanQRCode);

export default router;
