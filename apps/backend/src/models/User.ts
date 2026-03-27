import mongoose, { Document, Schema } from 'mongoose';
import { IUserBase } from '@auto-hub/shared/types/user';

// 1. Extend the shared interface, add Mongoose Document, and add the secret password
export interface IUserDocument extends Omit<IUserBase, '_id'>, Document {
  password?: string; // Strictly stays on the backend, optional for OAuth users
  googleId?: string; // Google OAuth ID
  role: 'customer' | 'provider' | null; // Allow null for users who haven't selected role yet
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
  },
  { timestamps: true }
);

export default mongoose.model<IUserDocument>('User', userSchema);