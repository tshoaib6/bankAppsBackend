import admin from "../utils/firebase";
import PushNotification from "../models/pushNotification.model";
import User from "../models/user.model";
import { IUser } from "../models/user.model";
import { messaging } from "firebase-admin"; // :point_left: import for typing
/**
 * Sends push notification to all users in a specified city with valid FCM tokens.
 */
export const sendPushNotificationToCity = async (
  city: string,
  title: string,
  body: string
) => {
  try {
    const normalizedCity = city.trim().toLowerCase();
    const users: IUser[] = await User.find({
      address: { $regex: `^${normalizedCity}$`, $options: "i" },
      fcmToken: { $exists: true, $ne: null },
    });
  

    if (!users.length) {
      return {
        success: false,
        message: `No users with valid FCM tokens found in ${city}.`,
      };
    }

    const tokens: string[] = users
      .map((user) => user.fcmToken)
      .filter((token): token is string => !!token && token.trim().length > 0);

    if (!tokens.length) {
      return {
        success: false,
        message: `No valid FCM tokens found in ${city}.`,
      };
    }


    const payload = {
      notification: {
        title,
        body,
      },
    };

    const messagingService = admin.messaging();
    const response = await messagingService.sendEachForMulticast({
      tokens,
      ...payload,
    });

 
    if (response.failureCount > 0) {
      const failedTokens = response.responses
        .map((res, index) => (res.success ? null : tokens[index]))
        .filter(Boolean);
      await User.updateMany(
        { fcmToken: { $in: failedTokens } },
        { $unset: { fcmToken: "" } }
      );
    }

    const sentToUserIds = users.map((user) => user._id.toString());
    await PushNotification.create({
      title,
      body,
      city,
      sentTo: sentToUserIds,
    });

    return {
      success: true,
      message: "Notifications sent successfully",
      firebaseResponse: {
        successCount: response.successCount,
        failureCount: response.failureCount,
      },
    };
  } catch (error) {
    console.error("FCM send error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
