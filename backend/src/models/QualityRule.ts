import { Schema, model, Document } from "mongoose";

export interface IQualityRule extends Document {
  grade: "A" | "B" | "C";
  multiplier: number;   // price multiplier
  description: string;
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
});

export const QualityRule = model<IQualityRule>(
  "QualityRule",
  QualityRuleSchema
);
