import mongoose, { Schema, Document } from 'mongoose';

export interface IRedemption {
  user: mongoose.Types.ObjectId;   // who redeemed
  code: string;                    // unique redemption code
  status: 'pending' | 'delivered'; // redemption status
  redeemedAt: Date;                // when redemption happened
}

export interface IBankPremium extends Document {
  title: string;
  description: string;
  points_required: string;
  start_date: Date;
  end_date: Date;
  image_url: string;
  active: boolean;
  enrolled_users: mongoose.Types.ObjectId[];
  brand?: string;
  redemptions: IRedemption[];
  qty?: number; // ✅ optional quantity field
}

const RedemptionSchema = new Schema<IRedemption>({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  code: { type: String, required: true },
  status: { type: String, enum: ['pending', 'delivered'], default: 'pending' },
  redeemedAt: { type: Date, default: Date.now }
});

const BankPremiumSchema: Schema<IBankPremium> = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    points_required: { type: String, required: true },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    image_url: { type: String, required: true },
    active: { type: Boolean, default: true },

    enrolled_users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: []
      }
    ],

    brand: {
      type: String,
      default: null
    },

    qty: {
      type: Number,       // ✅ quantity
      default: null       // optional
    },

    redemptions: [RedemptionSchema]
  },
  { timestamps: true }
);

// 🔹 Generate a unique redemption code helper
BankPremiumSchema.methods.generateRedemptionCode = function () {
  const code = Math.random().toString(36).substring(2, 10).toUpperCase();
  return code; // Example: "A1B2C3D4"
};

const BankPremium = mongoose.model<IBankPremium>('BankPremium', BankPremiumSchema);

export default BankPremium;
