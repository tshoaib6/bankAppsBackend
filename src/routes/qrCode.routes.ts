import express from 'express';
import * as QRCodeController from '../controllers/qrCodeController';

const router = express.Router();

// Create a new QR Code
router.post('/createqrCode', QRCodeController.createQRCode);

// Get all QR Codes
router.get('/getqrCode', QRCodeController.getAllQRCodes);

// Get QR Code by ID
router.get('/getqrCodeById:qrCodeId', QRCodeController.getQRCodeById);

// Update a QR Code
router.put('/updateqrCode/:qrCodeId', QRCodeController.updateQRCode);

// Delete QR Code
router.delete('/deleteqrCode/:qrCodeId', QRCodeController.deleteQRCode);


export default router;
