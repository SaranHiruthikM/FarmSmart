import mongoose, { Schema, model, Document } from "mongoose";

export interface IAdvisory extends Document {
    type: "tip" | "weather" | "seasonal";
    title: string;
    content: string;
    crop?: string;
    state?: string;
    scheduledDate?: Date;
    isScheduled: boolean;
    createdAt: Date;
}

const AdvisorySchema = new Schema<IAdvisory>(
    {
        type: { 
            type: String, 
            enum: ["tip", "weather", "seasonal"],
            default: "tip" 
        },
        title: { type: String, required: true },
        content: { type: String, required: true },
        crop: { type: String },
        state: { type: String },
        scheduledDate: { type: Date },
        isScheduled: { type: Boolean, default: false }
    },
    { timestamps: true }
);

export const Advisory = model<IAdvisory>("Advisory", AdvisorySchema);
