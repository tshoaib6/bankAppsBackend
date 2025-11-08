  import mongoose, { Schema, Document } from 'mongoose';
import { IBrand } from './brand.model';

  export interface IRedemption {
    user: mongoose.Types.ObjectId;
    code: string;
    status: 'pending' | 'delivered';
    redeemedAt: Date;
      count?: number; 

  }

  export interface IAdditionalItem extends Document {
    title: string;
    description: string;
    points_required: string;
    start_date: Date;
    end_date: Date;
    image_url: string;
    active: boolean;
    enrolled_users: mongoose.Types.ObjectId[];
  brand?: mongoose.Types.ObjectId | IBrand | null; // ✅ FIXED TYPE
    redemptions: IRedemption[];
    qty?: number;
  }

  const RedemptionSchema = new Schema<IRedemption>({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    code: { type: String, required: true },
    status: { type: String, enum: ['pending', 'delivered'], default: 'pending' },
    redeemedAt: { type: Date, default: Date.now },
    count: { type: Number, default: 1 }, 

  });

  const AdditionalItemSchema: Schema<IAdditionalItem> = new Schema(
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    default: null,
  },

      qty: {
        type: Number,
        default: null
      },

      redemptions: [RedemptionSchema]
    },
    { timestamps: true }
  );

  // 🔹 Helper method for redemption code
  AdditionalItemSchema.methods.generateRedemptionCode = function () {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    return code;
  };

  const AdditionalItem = mongoose.model<IAdditionalItem>('AdditionalItem', AdditionalItemSchema);

  export default AdditionalItem;
