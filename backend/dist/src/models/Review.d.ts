import { Types, Document } from "mongoose";
export interface IReview extends Document {
    orderId: Types.ObjectId;
    reviewerId: Types.ObjectId;
    revieweeId: Types.ObjectId;
    rating: number;
    comment?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Review: import("mongoose").Model<IReview, {}, {}, {}, Document<unknown, {}, IReview, {}, {}> & IReview & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Review.d.ts.map