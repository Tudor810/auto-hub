import mongoose, { Schema, Document } from 'mongoose';
import { ICar } from '@auto-hub/shared/types/carTypes'; // Adjust path as needed

// Extend Document and Omit the string IDs to replace them with Mongoose ObjectIds
export interface ICarDocument extends Omit<ICar, '_id' | 'userId'> {
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const carSchema = new Schema<ICarDocument>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    
    plateNr: { type: String, required: true, trim: true, uppercase: true }, // ex: B123ABC
    make: { type: String, required: true, trim: true },                     // ex: Volkswagen
    model: { type: String, required: true, trim: true },                    // ex: Golf
    year: { type: String, required: true },                                 // ex: 2018
    fuel: { type: String, required: true, trim: true },                     // ex: Diesel
    
    vin: { type: String, trim: true, uppercase: true },                     // ex: WVWZZZ...
    engineCapacity: { type: String, trim: true },                           // ex: 1968 cm³
    color: { type: String, trim: true },                                    // ex: Negru


    itpDate: { type: Date, default: null },
    rcaDate: { type: Date, default: null },
    rovinietaDate: { type: Date, default: null },
  },
  { timestamps: true }
);

// Optional but recommended: Add an index on userId to make fetching a user's cars faster
carSchema.index({ userId: 1 });

export default mongoose.model<ICarDocument>('Car', carSchema);