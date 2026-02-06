import mongoose, { Document } from 'mongoose';
export declare enum UserRole {
    FARMER = "FARMER",
    BUYER = "BUYER",
    COOPERATIVE = "COOPERATIVE",
    ADMIN = "ADMIN",
    LOGISTICS = "LOGISTICS"
}
export interface IUser extends Document {
    phoneNumber: string;
    email?: string;
    passwordHash: string;
    role: UserRole;
    fullName?: string;
    preferredLanguage: string;
    isVerified: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=User.d.ts.map