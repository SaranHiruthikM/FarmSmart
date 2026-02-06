import { Schema, model, Types, Document } from "mongoose";

export interface IReview extends Document {
  orderId: Types.ObjectId;
  reviewerId: Types.ObjectId;
  targetId: Types.ObjectId; // The user being reviewed (e.g., Farmer if Buyer reviews, Buyer if Farmer reviews)
  rating: number; // 1 to 5
  comment?: string;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Prevent duplicate reviews for the same order by the same reviewer
ReviewSchema.index({ orderId: 1, reviewerId: 1 }, { unique: true });

export const Review = model<IReview>("Review", ReviewSchema);
