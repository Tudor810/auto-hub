import mongoose, { Schema, Document } from 'mongoose';
import { IService } from '@auto-hub/shared/types/serviceTypes';

// Omit the string IDs AND the string price/duration
export interface IServiceDocument extends Omit<IService, '_id' | 'locationId' | 'price' | 'duration'>, Document {
  locationId: mongoose.Types.ObjectId;
  price: number;     // <-- Forced to number for the backend
  duration: number;  // <-- Forced to number for the backend
  createdAt: Date;
  updatedAt: Date;
}


const serviceSchema = new Schema<IServiceDocument>(
  {
    locationId: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    
    price: { 
      type: Number, 
      required: true,
      // The Setter intercepts the value before saving
      set: (value: string | number) => {
        if (typeof value === 'number') return value;
        // Removes any non-numeric characters (except a decimal point)
        // E.g., "100 RON" -> 100, "1,500.50" -> 1500.50
        const parsed = parseFloat(value.replace(/[^0-9.]/g, ''));
        return isNaN(parsed) ? 0 : parsed; 
      }
    },
    
    duration: { 
      type: Number, 
      required: true,
      set: (value: string | number) => {
        if (typeof value === 'number') return value;
        // E.g., "30 min" -> 30
        const parsed = parseInt(value.replace(/[^0-9]/g, ''), 10);
        return isNaN(parsed) ? 0 : parsed;
      }
    },
    
    category: { type: String, required: true, trim: true },
    isActive: { type: Boolean, required: true, default: false }
  },
  { timestamps: true }
);

export default mongoose.model<IServiceDocument>('Service', serviceSchema);