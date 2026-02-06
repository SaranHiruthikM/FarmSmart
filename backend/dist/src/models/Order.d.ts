import { Types, Document } from "mongoose";
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
export declare const Order: import("mongoose").Model<IOrder, {}, {}, {}, Document<unknown, {}, IOrder, {}, {}> & IOrder & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Order.d.ts.map