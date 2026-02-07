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
  currentStatus: "CREATED" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "COMPLETED";
  status: IOrderStatus[];
  createdAt: Date;
  updatedAt: Date;
}

const ORDER_STATUSES = ["CREATED", "CONFIRMED", "SHIPPED", "DELIVERED", "COMPLETED"] as const;

const OrderStatusSchema = new Schema<IOrderStatus>(
  {
    status: {
      type: String,
      required: true,
      enum: ORDER_STATUSES,
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
    },
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
    currentStatus: {
      type: String,
      enum: ORDER_STATUSES,
      default: "CREATED",
      required: true,
    },
    status: {
      type: [OrderStatusSchema],
      default: [],
      required: true,
    },
  },
  { timestamps: true }
);

const Order = model<IOrder>("Order", OrderSchema);

export { Order };
export default Order;
