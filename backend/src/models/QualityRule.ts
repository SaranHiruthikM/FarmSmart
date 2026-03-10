import { Schema, model, Document } from "mongoose";

export interface IQualityRule extends Document {
  grade: "A" | "B" | "C";
  multiplier: number;   // price multiplier
  description: string;
  minSize?: number;      // e.g., minimum size in mm or cm
  maxMoisture?: number;  // e.g., maximum moisture percentage
}

const QualityRuleSchema = new Schema<IQualityRule>({
  grade: {
    type: String,
    enum: ["A", "B", "C"],
    required: true,
    unique: true,
  },
  multiplier: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  minSize: {
    type: Number,
    default: 0
  },
  maxMoisture: {
    type: Number,
    default: 100
  }
});

export const QualityRule = model<IQualityRule>(
  "QualityRule",
  QualityRuleSchema
);
