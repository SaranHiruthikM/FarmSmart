import mongoose, { Schema, model, Document } from "mongoose";

export interface IAdvisory extends Document {
    type: "tip" | "weather" | "seasonal" | "rotation";
    title: string;
    content: string;
    crop?: string;
    profitabilityScore?: number;
    createdAt: Date;
}

const AdvisorySchema = new Schema<IAdvisory>(
    {
        type: {
            type: String,
            enum: ["tip", "weather", "seasonal", "rotation"],
            default: "tip"
        },
        title: { type: String, required: true },
        content: { type: String, required: true },
        crop: { type: String },
        profitabilityScore: { type: Number },
    },
    { timestamps: true }
);

export const Advisory = model<IAdvisory>("Advisory", AdvisorySchema);
