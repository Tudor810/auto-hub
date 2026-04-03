import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointmentDocument extends Document {
  clientId: mongoose.Types.ObjectId;
  locationId: mongoose.Types.ObjectId;
  carId: mongoose.Types.ObjectId;
  serviceIds: mongoose.Types.ObjectId[];
  
  date: string;
  time: string;
  notes: string;
  
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  totalPrice: number;
  totalDuration: number;
  
  // Mongoose automatically handles these via { timestamps: true }
  createdAt: Date;
  updatedAt: Date; 
}

const appointmentSchema = new Schema<IAppointmentDocument>(
  {
    // --- RELATIONS ---
    clientId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    locationId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Location', 
      required: true 
    },
    carId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Car', 
      required: true 
    },
    serviceIds: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'Service',
      required: true
    }],

    // --- APPOINTMENT DETAILS ---
    date: { 
      type: String, 
      required: true,
      trim: true 
    },
    time: { 
      type: String, 
      required: true, 
      trim: true // ex: "09:00"
    },
    notes: { 
      type: String, 
      trim: true,
      default: ''
    },

    // --- STATUS & FINANCIALS ---
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
      required: true
    },
    totalPrice: { 
      type: Number, 
      required: true,
      min: 0
    },
    totalDuration: { 
      type: Number, 
      required: true,
      min: 0 // In minutes
    }
  },
  { timestamps: true }
);

// --- INDEXES ---
// 1. Index for fetching a user's appointment history quickly
appointmentSchema.index({ clientId: 1 });

// 2. Compound index specifically optimized for your `getAvailableSlots` controller!
// It searches by locationId and date constantly, so this makes that query extremely fast.
appointmentSchema.index({ locationId: 1, date: 1 });

export default mongoose.model<IAppointmentDocument>('Appointment', appointmentSchema);