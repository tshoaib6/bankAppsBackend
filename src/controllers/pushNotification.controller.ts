import { Request, Response } from 'express';
import { sendPushNotificationToCity } from '../services/pushNotification.service';

export const sendPushNotification = async (req: Request, res: Response):Promise<any> => {
  const { city, title, body } = req.body;

  if (!city || !title || !body) {
    return res.status(400).json({ error: 'City, title, and body are required.' });
  }

  try {
    const result = await sendPushNotificationToCity(city, title, body);

    if (!result.success) {
      return res.status(500).json({
        error: result.error || result.message || 'Failed to send notification',
      });
    }

    return res.status(200).json({
      message: 'Notification sent successfully',
      firebaseResponse: result.firebaseResponse, // ✅ Correct key
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Unexpected server error while sending notification',
    });
  }
};
