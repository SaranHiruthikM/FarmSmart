import { Schema, model, Types, Document } from "mongoose";

export interface IPool extends Document {
    cropName: string;
    targetQuantity: number;
    currentQuantity: number;
    unit: "kg" | "quintal" | "ton";
    district: string;
    state: string;
    basePrice: number;
    status: "OPEN" | "LOCKED" | "SOLD" | "EXPIRED";
    members: {
        farmerId: Types.ObjectId;
        cropId: Types.ObjectId;
        contributedQuantity: number;
    }[];
    buyerId?: Types.ObjectId;
    expiryDate: Date;
    createdAt: Date;
    updatedAt: Date;
}

const PoolSchema = new Schema<IPool>(
    {
        cropName: { type: String, required: true, index: true },
        targetQuantity: { type: Number, required: true },
        currentQuantity: { type: Number, default: 0 },
        unit: { type: String, enum: ["kg", "quintal", "ton"], required: true },
        district: { type: String, required: true, index: true },
        state: { type: String, required: true },
        basePrice: { type: Number, required: true },
        status: {
            type: String,
            enum: ["OPEN", "LOCKED", "SOLD", "EXPIRED"],
            default: "OPEN"
        },
        members: [
            {
                farmerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
                cropId: { type: Schema.Types.ObjectId, ref: "Crop", required: true },
                contributedQuantity: { type: Number, required: true }
            }
        ],
        buyerId: { type: Schema.Types.ObjectId, ref: "User" },
        expiryDate: { type: Date, required: true }
    },
    { timestamps: true }
);

// Virtual to calculate progress percentage
PoolSchema.virtual('progress').get(function () {
    return Math.min(Math.round((this.currentQuantity / this.targetQuantity) * 100), 100);
});

PoolSchema.set('toJSON', { virtuals: true });
PoolSchema.set('toObject', { virtuals: true });

export const Pool = model<IPool>("Pool", PoolSchema);
