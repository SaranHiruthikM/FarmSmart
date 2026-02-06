import { Document } from "mongoose";
export interface IQualityRule extends Document {
    grade: "A" | "B" | "C";
    multiplier: number;
    description: string;
}
export declare const QualityRule: import("mongoose").Model<IQualityRule, {}, {}, {}, Document<unknown, {}, IQualityRule, {}, {}> & IQualityRule & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=QualityRule.d.ts.map