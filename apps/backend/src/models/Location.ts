import mongoose, { Schema, Document } from 'mongoose';
import { ILocationFormData } from '@auto-hub/shared/types/locationTypes';

// 1. Update the Interface
// We use TypeScript's `Omit` to remove the string-based 'coordinates' from the base interface,
// allowing us to define the actual DB structure ('location') while redefining 'coordinates' for the virtual.
export interface ILocationDocument extends Omit<ILocationFormData, 'coordinates'>, Document {
  companyId: mongoose.Types.ObjectId;
  // This is the actual data structure MongoDB needs for map queries
  location: {
    type: 'Point';
    coordinates: [number, number]; // STRICTLY [longitude, latitude]
  };
  // We keep coordinates here so TypeScript knows the virtual exists
  coordinates: {
    latitude: string;
    longitude: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const dayScheduleSchema = new Schema({
  open: { type: String, required: true },
  close: { type: String, required: true },
  isOpen: { type: Boolean, default: true }
}, { _id: false });

const locationSchema = new Schema<ILocationDocument>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    description: { type: String },
    services: [{ type: String }],
    schedule: {
      luni: dayScheduleSchema,
      marti: dayScheduleSchema,
      miercuri: dayScheduleSchema,
      joi: dayScheduleSchema,
      vineri: dayScheduleSchema,
      sambata: dayScheduleSchema,
      duminica: dayScheduleSchema
    },

    // 2. Define the GeoJSON location field for the database
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true
      },
      coordinates: {
        type: [Number], // Note: MongoDB expects [longitude, latitude]
        required: true
      }
    },
    reviews: {
      type: Number,
      required: false
    },
    rating: {
      type: Number,
      required: false
    },
    googlePlaceId: {
      type: String,
      required: false
    }
  },
  {
    timestamps: true,
    // 3. CRUCIAL: Tell Mongoose to include virtuals when returning JSON
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// 4. Create the geospatial index to make map queries lightning fast
locationSchema.index({ location: '2dsphere' });

// 5. Create the Virtual "Bridge"
locationSchema.virtual('coordinates')
  // GETTER: When you fetch from DB, convert GeoJSON numbers back to your frontend's String format
  .get(function (this: ILocationDocument) {
    if (!this.location || !this.location.coordinates) return undefined;
    return {
      latitude: this.location.coordinates[1].toString(),
      longitude: this.location.coordinates[0].toString()
    };
  })
  // SETTER: When frontend sends String coordinates, convert to GeoJSON numbers before saving
  .set(function (this: any, coords: { latitude: string; longitude: string }) {
    if (coords && coords.latitude && coords.longitude) {
      this.set('location', {
        type: 'Point',
        coordinates: [parseFloat(coords.longitude), parseFloat(coords.latitude)] // Longitude MUST be first
      });
    }
  });

export default mongoose.model<ILocationDocument>('Location', locationSchema);