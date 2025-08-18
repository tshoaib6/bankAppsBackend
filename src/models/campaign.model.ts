import mongoose, { Schema, Document } from 'mongoose';

export interface IUserRedemption {
  user: mongoose.Types.ObjectId;   // reference to User
  count: number;                   // how many times redeemed
  lastRedeemedAt: Date;            // when last redeemed
}

export interface ICampaign extends Document {
  title: string;
  description: string;
  points_required: string;
  start_date: Date;
  end_date: Date;
  image_url: string;
  active: boolean;
  enrolled_users: string[];
  brand: mongoose.Types.ObjectId;  // Brand reference
  redemptions: IUserRedemption[];  // 👈 New field
}

const CampaignSchema: Schema<ICampaign> = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    points_required: { type: String, required: true },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    image_url: { type: String, required: true },
    active: { type: Boolean, default: true },
    enrolled_users: { type: [String], default: [] },

    // 🔥 New field to associate campaign with a brand
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      required: true,
    },

    // 👇 New field to track redemptions per user
    redemptions: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        count: { type: Number, default: 1 },
        lastRedeemedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Campaign = mongoose.model<ICampaign>('Campaign', CampaignSchema);

export default Campaign;
