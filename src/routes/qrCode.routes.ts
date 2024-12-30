import express from 'express';
import * as QRCodeController from '../controllers/qrCodeController';

const router = express.Router();

// Create a new QR Code
router.post('/createqrCode', QRCodeController.createQRCode);

// Get all QR Codes
router.get('/getqrCode', QRCodeController.getAllQRCodes);

// Get QR Code by ID
router.get('/:qrCodeId', QRCodeController.getQRCodeById);

// Update a QR Code
router.put('/:qrCodeId', QRCodeController.updateQRCode);

// Delete a QR Code
router.delete('/:qrCodeId', QRCodeController.deleteQRCode);

export default router;
