import mongoose, { Schema, Document } from 'mongoose';

export interface IPromotion extends Document {
  title: string;
  description: string;
  points_required: number;
  start_date: Date;
  end_date: Date;
  image_url: string;
  active: boolean;
  enrolled_users: mongoose.Types.ObjectId[];
  stores: mongoose.Types.ObjectId[]; // Stores associated with this promotion
  createdBy: mongoose.Types.ObjectId; // User who created the promotion
}

const PromotionSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    points_required: {
      type: Number,
      required: true,
    },
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
      required: true,
    },
    image_url: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    enrolled_users: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'User', // Assuming you have a User collection
      },
    ],
    stores: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'Store', // Referencing the Store model
        required: true,
      },
    ],
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User', // Referencing the User model
      required: true, // This will be set when creating the promotion
    },
  },
  { timestamps: true }
);

const Promotion = mongoose.model<IPromotion>('Promotion', PromotionSchema);

export default Promotion;
