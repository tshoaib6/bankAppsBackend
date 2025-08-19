import mongoose, { Schema, Document } from "mongoose";

export interface IBankOffer extends Document {
    title: string;
    description: string;
    discount: number;
    validFrom: Date;
    validTo: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const BankOfferSchema: Schema = new Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        discount: { type: Number, required: true }, // percentage or flat value
        validFrom: { type: Date, required: true },
        validTo: { type: Date, required: true },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default mongoose.model<IBankOffer>("BankOffer", BankOfferSchema);
