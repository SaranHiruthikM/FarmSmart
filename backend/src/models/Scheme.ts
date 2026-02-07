import mongoose, { Schema, model, Document } from "mongoose";

export interface IScheme extends Document {
    name: string;
    description: string;
    eligibilityCriteria: string;
    applicableStates: string[];
}

const SchemeSchema = new Schema<IScheme>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    eligibilityCriteria: { type: String },
    applicableStates: [String],
});

export const Scheme = model<IScheme>("Scheme", SchemeSchema);
