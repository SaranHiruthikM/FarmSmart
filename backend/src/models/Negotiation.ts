import { Schema, model, Types, Document } from "mongoose";

/* -------------------- OFFER -------------------- */
export interface IOffer {
  by: "BUYER" | "FARMER";
  pricePerUnit: number;
  quantity: number;
  message?: string;
  createdAt: Date;
}

/* -------------------- NEGOTIATION -------------------- */
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

/* -------------------- OFFER SCHEMA -------------------- */
const OfferSchema = new Schema<IOffer>({
  by: { type: String, enum: ["BUYER", "FARMER"], required: true },
  pricePerUnit: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 0 },
  message: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
});

/* -------------------- NEGOTIATION SCHEMA -------------------- */
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
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED"],
      default: "PENDING",
    },
    offers: {
      type: [OfferSchema],
      default: [],
    },
    agreedPrice: {
      type: Number,
      min: 0,
    },
    agreedQuantity: {
      type: Number,
      min: 0,
    },
  },
  { timestamps: true }
);

export const Negotiation = model<INegotiation>(
  "Negotiation",
  NegotiationSchema
);
