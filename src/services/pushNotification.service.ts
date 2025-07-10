import admin from '../utils/firebase';
import PushNotification from '../models/pushNotification.model';
import User from '../models/user.model';
import { IUser } from '../models/user.model';
import { messaging } from 'firebase-admin'; // 👈 import for typing

/**
 * Sends push notification to all users in a specified city with valid FCM tokens.
 */
export const sendPushNotificationToCity = async (
  city: string,
  title: string,
  body: string
) => {
  try {
    // 1. Fetch users with FCM token and matching city
    const users: IUser[] = await User.find({
      address: city,
      fcmToken: { $exists: true, $ne: null },
    });

    if (!users.length) {
      return {
        success: false,
        message: `No users with valid FCM tokens found in ${city}.`,
      };
    }

    // 2. Extract FCM tokens
    const tokens: string[] = users
      .map((user) => user.fcmToken)
      .filter(Boolean) as string[];

    // 3. Prepare FCM payload
    const payload = {
      notification: {
        title,
        body,
      },
    };

    // ✅ 4. FIXED: Use explicitly typed messaging
    const messagingService: messaging.Messaging = admin.messaging();

    const response = await admin.messaging().sendEachForMulticast({
        tokens,
        notification: {
          title,
          body,
        },
      });

    // 5. Log in DB
    const sentToUserIds = users.map((user) => user._id.toString());
    await PushNotification.create({
      title,
      body,
      city,
      sentTo: sentToUserIds,
    });

    return {
      success: true,
      message: 'Notifications sent successfully',
      firebaseResponse: response,
    };
  } catch (error) {
    console.error('FCM send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
