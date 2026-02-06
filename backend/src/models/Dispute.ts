import { Schema, model, Types, Document } from "mongoose";

export interface IDispute extends Document {
    orderId: Types.ObjectId;
    raisedBy: Types.ObjectId;
    raisedByRole: "BUYER" | "FARMER";
    reason: "QUALITY" | "QUANTITY" | "DELIVERY" | "PAYMENT";
    description: string;
    status: "OPEN" | "RESOLVED" | "REJECTED";
    adminRemark?: string;
    createdAt: Date;
    updatedAt: Date;
}

const DisputeSchema = new Schema<IDispute>(
    {
        orderId: {
            type: Schema.Types.ObjectId,
            ref: "Order",
            required: true,
            unique: true, // one dispute per order
        },
        raisedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        raisedByRole: {
            type: String,
            enum: ["BUYER", "FARMER"],
            required: true,
        },
        reason: {
            type: String,
            enum: ["QUALITY", "QUANTITY", "DELIVERY", "PAYMENT"],
            required: true,
        },
        description: {
            type: String,
            required: true,
            maxlength: 500,
        },
        status: {
            type: String,
            enum: ["OPEN", "RESOLVED", "REJECTED"],
            default: "OPEN",
        },
        adminRemark: {
            type: String,
            maxlength: 500,
        },
    },
    { timestamps: true }
);

export const Dispute = model<IDispute>("Dispute", DisputeSchema);
