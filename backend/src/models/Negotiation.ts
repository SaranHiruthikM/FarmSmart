import { Schema, model, Types, Document } from "mongoose";

export interface IOffer {
  by: "BUYER" | "FARMER";
  pricePerUnit: number;
  quantity: number;
  message?: string;
  createdAt: Date;
}

export interface INegotiation extends Document {
  cropId: Types.ObjectId;
  buyerId: Types.ObjectId;
  farmerId: Types.ObjectId;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  offers: IOffer[];
  agreedPrice?: number;
  agreedQuantity?: number;
  createdAt: Date;
  updatedAt: Date;
}

const OfferSchema = new Schema<IOffer>({
  by: { type: String, enum: ["BUYER", "FARMER"], required: true },
  pricePerUnit: { type: Number, required: true },
  quantity: { type: Number, required: true },
  message: String,
  createdAt: { type: Date, default: Date.now },
});

const NegotiationSchema = new Schema<INegotiation>(
  {
    cropId: {
      type: Schema.Types.ObjectId,
      ref: "Crop",
      required: true,
    },
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    farmerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED"],
      default: "PENDING",
    },
    offers: [OfferSchema],
    agreedPrice: Number,
    agreedQuantity: Number,
  },
  { timestamps: true }
);

export const Negotiation = model<INegotiation>(
  "Negotiation",
  NegotiationSchema
);
