import mongoose, { Schema, model, Document } from "mongoose";

export interface IScheme extends Document {
    name: string;
    description: string;
    benefits: string[];
    applyLink: string;
    eligibilityCriteria: string; // Text description
    applicableStates?: string[]; // For filtering
}

const SchemeSchema = new Schema<IScheme>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    benefits: [{ type: String }],
    applyLink: { type: String },
    eligibilityCriteria: { type: String },
    applicableStates: [String],
});

export const Scheme = model<IScheme>("Scheme", SchemeSchema);
