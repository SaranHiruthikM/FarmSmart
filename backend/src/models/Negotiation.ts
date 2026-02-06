import { Schema, model, Types, Document } from "mongoose";

export interface IOffer {
  by: "BUYER" | "FARMER";
  pricePerUnit: number;
  quantity: number;
  message?: string;
  createdAt: Date;
}

export interface INegotiation extends Document {
  buyerId: Types.ObjectId;
  farmerId: Types.ObjectId;
  cropId: Types.ObjectId;
  agreedPrice: number;
  agreedQuantity: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  offers: IOffer[];
  createdAt: Date;
  updatedAt: Date;
}

const OfferSchema = new Schema<IOffer>(
  {
    by: { type: String, enum: ["BUYER", "FARMER"], required: true },
    pricePerUnit: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 0 },
    message: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

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
      default: 0,
    },
    agreedQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
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
  },
  { timestamps: true }
);

const Negotiation = model<INegotiation>("Negotiation", NegotiationSchema);

export { Negotiation };
export default Negotiation;
