import mongoose, { Schema } from 'mongoose';
import {ICompany} from '@auto-hub/shared/types/companyTypes'


export interface ICompanyDocument extends Omit<ICompany, '_id' | 'ownerId'>, Document {
  ownerId: mongoose.Types.ObjectId;
  // '_id' este inclus automat de extensia 'Document'
  createdAt: Date;
  updatedAt: Date;
}

const companySchema = new Schema<ICompanyDocument>(
  {
    ownerId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true, 
      unique: true 
    },
    
    name: { type: String, required: true, trim: true },       // ex: SC Auto Service SRL
    admin: { type: String, required: true, trim: true },      // ex: Tudor
    email: { type: String, required: true, lowercase: true }, // Email public contact
    phone: { type: String, required: true },                  // Telefon contact
    cui: { type: String, required: true, uppercase: true },   // ex: RO12345678
    regCom: { type: String, required: true, uppercase: true },// ex: J12/345/2020
  },
  { timestamps: true }
);

export default mongoose.model<ICompanyDocument>('Company', companySchema);