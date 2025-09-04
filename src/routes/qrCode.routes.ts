import express from 'express';
import * as QRCodeController from '../controllers/qrCodeController';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/createqrCode', QRCodeController.createQRCode);

router.get('/getqrCode', QRCodeController.getAllQRCodes);

router.get('/getqrCodeById:qrCodeId', QRCodeController.getQRCodeById);

router.put('/updateqrCode/:qrCodeId', QRCodeController.updateQRCode);

router.delete('/deleteqrCode/:qrCodeId', QRCodeController.deleteQRCode);

router.get('/getQRCodeBybrandId/:brandId', QRCodeController.getQRCodesByBrandId);

router.post('/qrcodes/upload', upload.single('file'), QRCodeController.bulkUploadQRCodes);

router.get("/qr-code-usage-by-users", QRCodeController.getQRCodeUsageByUsersController);

export default router;
