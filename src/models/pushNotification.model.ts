import mongoose, { Schema, Document } from 'mongoose';

export interface IPushNotification extends Document {
  title: string;
  body: string;
  city: string; // Optional filter for target users
  sentTo: string[]; // Array of user IDs or tokens
  createdAt: Date;
}

export const PushNotificationSchema: Schema<IPushNotification> = new Schema({
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  sentTo: [
    {
      type: String, // Could be userId or FCM token
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

 const PushNotification = mongoose.model<IPushNotification>(
  'PushNotification',
  PushNotificationSchema
);

export default PushNotification;