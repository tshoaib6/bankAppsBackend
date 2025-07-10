import express from 'express';
import { sendPushNotification } from '../controllers/pushNotification.controller';

const router = express.Router();

router.post('/send', sendPushNotification); // POST /api/notifications/send

export default router;
