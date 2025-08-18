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
    console.log(`Looking for users in ${city} with FCM tokens`);
    const normalizedCity = city.trim().toLowerCase();
    const users: IUser[] = await User.find({
      address: { $regex: `^${normalizedCity}$`, $options: "i" },
      fcmToken: { $exists: true, $ne: null },
    });
    console.log(`Found ${users.length} users with FCM tokens in ${city}`);
    console.log(
      "Users:",
      users.map((u) => ({
        id: u._id,
        address: u.address,
        fcmToken: u.fcmToken,
      }))
    );

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

    console.log("Sending notifications to tokens:", tokens);

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

    console.log("Firebase response:", {
      successCount: response.successCount,
      failureCount: response.failureCount,
      responses: response.responses.map((res, index) => ({
        token: tokens[index],
        success: res.success,
        error: res.error ? res.error.message : null,
      })),
    });

    if (response.failureCount > 0) {
      const failedTokens = response.responses
        .map((res, index) => (res.success ? null : tokens[index]))
        .filter(Boolean);
      console.log("Removing failed tokens:", failedTokens);
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
