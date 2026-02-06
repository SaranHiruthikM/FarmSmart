import mongoose, { Schema, model, Document } from "mongoose";

export interface IAdvisory extends Document {
    title: string;
    message: string;
    crop?: string;
    createdAt: Date;
}

const AdvisorySchema = new Schema<IAdvisory>(
    {
        title: { type: String, required: true },
        message: { type: String, required: true },
        crop: { type: String },
    },
    { timestamps: true }
);

export const Advisory = model<IAdvisory>("Advisory", AdvisorySchema);
