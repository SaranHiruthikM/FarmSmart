import mongoose, { Document, Schema } from 'mongoose';

export enum VerificationType {
  PHONE = 'PHONE',
  EMAIL = 'EMAIL'
}

export interface IVerificationCode extends Document {
  contact: string;
  code: string;
  type: VerificationType;
  expiresAt: Date;
  createdAt: Date;
}

const VerificationCodeSchema: Schema = new Schema({
  contact: { type: String, required: true, index: true },
  code: { type: String, required: true },
  type: { 
    type: String, 
    enum: Object.values(VerificationType), 
    required: true 
  },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 } // Auto delete after 5 mins? (Or handled by expiresAt logic)
});

export default mongoose.model<IVerificationCode>('VerificationCode', VerificationCodeSchema);
