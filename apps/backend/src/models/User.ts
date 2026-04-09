import mongoose, { Document, Schema } from 'mongoose';
import { IUserBase } from '@auto-hub/shared/types/userTypes';

// 1. Extend the shared interface, add Mongoose Document, and add the secret password
export interface IUserDocument extends Omit<IUserBase, '_id'>, Document {
  password?: string; // Strictly stays on the backend, optional for OAuth users
  googleId?: string; // Google OAuth ID
  role: 'customer' | 'provider' | null; // Allow null for users who haven't selected role yet
  pushToken?: string;
  resetToken?: string | undefined;
  resetTokenExpiry?: Number | undefined
}

// 2. The Schema uses the backend-specific interface
const userSchema = new Schema<IUserDocument>(
  {
    role: { type: String, enum: ['customer', 'provider', null], required: false },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phoneNumber: { type: String, required: false, sparse: true, unique: true, trim: true },
    password: { type: String, required: false, minlength: 6 },
    termsAccepted: { type: Boolean, required: true, default: true },
    googleId: { type: String, required: false, sparse: true, unique: true },
    notificationPreferences: {
        appointments: { type: Boolean, default: true },
        documents: { type: Boolean, default: true },
        promotions: { type: Boolean, default: false },
        service: { type: Boolean, default: true },
    },
    pushToken: {type: String, required: false},
    resetToken: { type: String, required: false },
    resetTokenExpiry: { type: Number, required: false },
  },
  { timestamps: true }
);

export default mongoose.model<IUserDocument>('User', userSchema);