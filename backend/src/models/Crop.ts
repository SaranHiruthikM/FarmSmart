import { Schema, model, Types, Document } from "mongoose";

export interface ICrop extends Document {
  farmerId: Types.ObjectId;
  name: string;                 // Tomato, Rice, etc.
  variety?: string;             // Optional
  quantity: number;             // in kg / quintal
  unit: "kg" | "quintal" | "ton";
  basePrice: number;            // expected price per unit
  finalPrice: number;           // calculated price after quality multiplier
  qualityGrade: "A" | "B" | "C";
  location: {
    state: string;
    district: string;
    village?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CropSchema = new Schema<ICrop>(
  {
    farmerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      index: true,
    },
    variety: String,
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      enum: ["kg", "quintal", "ton"],
      required: true,
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    finalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    qualityGrade: {
      type: String,
      enum: ["A", "B", "C"],
      required: true,
    },
    location: {
      state: { type: String, required: true },
      district: { type: String, required: true },
      village: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Crop = model<ICrop>("Crop", CropSchema);
