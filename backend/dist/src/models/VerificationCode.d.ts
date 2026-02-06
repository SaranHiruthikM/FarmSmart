import mongoose, { Document } from 'mongoose';
export declare enum VerificationType {
    PHONE = "PHONE",
    EMAIL = "EMAIL"
}
export interface IVerificationCode extends Document {
    contact: string;
    code: string;
    type: VerificationType;
    expiresAt: Date;
    createdAt: Date;
}
declare const _default: mongoose.Model<IVerificationCode, {}, {}, {}, mongoose.Document<unknown, {}, IVerificationCode, {}, {}> & IVerificationCode & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=VerificationCode.d.ts.map