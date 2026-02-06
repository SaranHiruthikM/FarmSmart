import { Schema, model, Types, Document } from "mongoose";

export interface INegotiation extends Document {
  buyerId: Types.ObjectId;
  farmerId: Types.ObjectId;
  cropId: Types.ObjectId;
  agreedPrice: number;
  agreedQuantity: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: Date;
  updatedAt: Date;
}

const NegotiationSchema = new Schema<INegotiation>(
  {
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    farmerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    cropId: {
      type: Schema.Types.ObjectId,
      ref: "Crop",
      required: true,
      index: true,
    },
    agreedPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    agreedQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED"],
      required: true,
      default: "PENDING",
    },
  },
  { timestamps: true }
);

export const Negotiation = model<INegotiation>("Negotiation", NegotiationSchema);
