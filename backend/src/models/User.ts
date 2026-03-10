import mongoose, { Document, Schema } from 'mongoose';

export enum UserRole {
  FARMER = 'FARMER',
  BUYER = 'BUYER',
  COOPERATIVE = 'COOPERATIVE',
  ADMIN = 'ADMIN',
  LOGISTICS = 'LOGISTICS'
}

export interface IUser extends Document {
  phoneNumber: string;
  email?: string;
  passwordHash: string;
  role: UserRole;
  fullName?: string;
  preferredLanguage: string;
  isVerified: boolean;
  kycDocumentUrl?: string;
  kycStatus: "PENDING" | "APPROVED" | "REJECTED" | "NOT_SUBMITTED";
  isActive: boolean;
  // Reputation
  averageRating: number;
  reviewCount: number;
  
  // Location
  state: string;
  district: string;
  address?: string;

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    phoneNumber: { type: String, required: true, unique: true },
    email: { type: String, unique: true, sparse: true }, // sparse allows multiple nulls
    passwordHash: { type: String, required: true },
    role: { 
      type: String, 
      enum: Object.values(UserRole), 
      default: UserRole.FARMER 
    },
    fullName: { type: String },
    
    // Location
    state: { type: String, required: true },
    district: { type: String, required: true },
    address: { type: String },

    preferredLanguage: { type: String, default: 'en' },
    isVerified: { type: Boolean, default: false },
    kycDocumentUrl: { type: String },
    kycStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "NOT_SUBMITTED"],
      default: "NOT_SUBMITTED"
    },
    isActive: { type: Boolean, default: true },
    
    // Reputation Fields
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

export default mongoose.model<IUser>('User', UserSchema);
