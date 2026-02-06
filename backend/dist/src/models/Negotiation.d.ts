import { Types, Document } from "mongoose";
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
export declare const Negotiation: import("mongoose").Model<INegotiation, {}, {}, {}, Document<unknown, {}, INegotiation, {}, {}> & INegotiation & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Negotiation.d.ts.map