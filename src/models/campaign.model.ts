import mongoose, { Schema, Document } from 'mongoose';

// Define the interface for the Campaign document
export interface ICampaign extends Document {
  title: string;
  description: string;
  points_required: string;
  start_date: Date;
  end_date: Date;
  image_url: string;
  active: boolean;
  enrolled_users: string[]; // Array of user IDs (as strings)
}

// Define the schema for the Campaign model
const CampaignSchema: Schema<ICampaign> = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    points_required: { type: String, required: true },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    image_url: { type: String, required: true },
    active: { type: Boolean, default: true }, // Default to active
    enrolled_users: { type: [String], default: [] }, // Array of user IDs (strings)
  },
  { timestamps: true } // Automatically adds `createdAt` and `updatedAt` fields
);

// Create the Campaign model
const Campaign = mongoose.model<ICampaign>('Campaign', CampaignSchema);

export default Campaign;
