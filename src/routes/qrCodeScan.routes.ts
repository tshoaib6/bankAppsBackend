// routes/qrCodeRoutes.ts

import { Router } from 'express';
import  {scanQRCode}  from '../controllers/qrCodeScanController';

const router = Router();

router.post('/scan', scanQRCode);

export default router;
