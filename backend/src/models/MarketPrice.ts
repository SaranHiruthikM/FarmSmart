import { Schema, model, Document } from "mongoose";

export interface IMarketPrice extends Document {
  crop: string;            // Tomato, Rice
  mandi: string;           // Coimbatore Mandi
  location: {
    state: string;
    district: string;
  };
  pricePerKg: number;      // normalized price
  date: Date;
}

const MarketPriceSchema = new Schema<IMarketPrice>({
  crop: {
    type: String,
    required: true,
    index: true,
  },
  mandi: {
    type: String,
    required: true,
  },
  location: {
    state: { type: String, required: true },
    district: { type: String, required: true },
  },
  pricePerKg: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    index: true,
  },
});

export const MarketPrice = model<IMarketPrice>(
  "MarketPrice",
  MarketPriceSchema
);
