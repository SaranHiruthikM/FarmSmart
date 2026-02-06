import { Types, Document } from "mongoose";
export interface ICrop extends Document {
    farmerId: Types.ObjectId;
    name: string;
    variety?: string;
    quantity: number;
    unit: "kg" | "quintal" | "ton";
    basePrice: number;
    finalPrice: number;
    qualityGrade: "A" | "B" | "C";
    location: {
        state: string;
        district: string;
        village?: string;
    };
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Crop: import("mongoose").Model<ICrop, {}, {}, {}, Document<unknown, {}, ICrop, {}, {}> & ICrop & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Crop.d.ts.map