import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ILead extends Document {
  carId: Types.ObjectId;
  carTitle?: string;
  carBrand?: string;
  carModel?: string;
  carPrice?: number;
  carImages?: string[];
  name: string;
  phone: string;
  email?: string;
  message?: string;
  status: 'new' | 'in_progress' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    carId: {
      type: Schema.Types.ObjectId,
      ref: 'Car',
      required: true,
    },
    carTitle: {
      type: String,
      trim: true,
    },
    carBrand: {
      type: String,
      trim: true,
    },
    carModel: {
      type: String,
      trim: true,
    },
    carPrice: {
      type: Number,
    },
    carImages: {
      type: [String],
      default: [],
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    message: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['new', 'in_progress', 'closed'],
      default: 'new',
    },
  },
  {
    timestamps: true,
  }
);

LeadSchema.index({ carId: 1 });
LeadSchema.index({ status: 1 });
LeadSchema.index({ createdAt: -1 });

export const Lead = mongoose.model<ILead>('Lead', LeadSchema);

