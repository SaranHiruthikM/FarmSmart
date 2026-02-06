import { Schema, model, Types, Document } from "mongoose";

export interface IOrderStatus {
  status: string;
  timestamp: Date;
}

export interface IOrder extends Document {
  negotiationId: Types.ObjectId;
  cropId: Types.ObjectId;
  buyerId: Types.ObjectId;
  farmerId: Types.ObjectId;
  pricePerUnit: number;
  quantity: number;
  totalAmount: number;
  status: IOrderStatus[];
  currentStatus: "CREATED" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "COMPLETED";
  createdAt: Date;
  updatedAt: Date;
}

const OrderStatusSchema = new Schema<IOrderStatus>(
  {
    status: {
      type: String,
      required: true,
      enum: ["CREATED", "CONFIRMED", "SHIPPED", "DELIVERED", "COMPLETED"],
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    negotiationId: {
      type: Schema.Types.ObjectId,
      ref: "Negotiation",
      required: true,
      index: true,
    },
    cropId: {
      type: Schema.Types.ObjectId,
      ref: "Crop",
      required: true,
      index: true,
    },
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
    pricePerUnit: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: [OrderStatusSchema],
      required: true,
      default: [],
    },
    currentStatus: {
      type: String,
      required: true,
      enum: ["CREATED", "CONFIRMED", "SHIPPED", "DELIVERED", "COMPLETED"],
      default: "CREATED",
    },
  },
  { timestamps: true }
);

export const Order = model<IOrder>("Order", OrderSchema);
