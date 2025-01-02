import express from 'express';
import * as QRCodeController from '../controllers/qrCodeController';

const router = express.Router();

router.post('/createqrCode', QRCodeController.createQRCode);

router.get('/getqrCode', QRCodeController.getAllQRCodes);

router.get('/getqrCodeById:qrCodeId', QRCodeController.getQRCodeById);

router.put('/updateqrCode/:qrCodeId', QRCodeController.updateQRCode);

router.delete('/deleteqrCode/:qrCodeId', QRCodeController.deleteQRCode);


export default router;
