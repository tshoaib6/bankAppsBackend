import mongoose, { Schema, Document } from 'mongoose';

export interface IBankPremium extends Document {
  title: string;
  description: string;
  points_required: string;
  start_date: Date;
  end_date: Date;
  image_url: string;
  active: boolean;
  enrolled_users: string[]; 
}

const BankPremiumSchema: Schema<IBankPremium> = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    points_required: { type: String, required: true },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    image_url: { type: String, required: true },
    active: { type: Boolean, default: true }, 
    enrolled_users: { type: [String], default: [] }, 
  },
  { timestamps: true } 
);

const BankPremium = mongoose.model<IBankPremium>('BankPremium', BankPremiumSchema);

export default BankPremium;
