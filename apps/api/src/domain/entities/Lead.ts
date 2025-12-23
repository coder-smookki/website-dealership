import { ObjectId } from 'mongodb';

/**
 * Domain Entity - Lead
 * Represents a customer inquiry about a car
 */
export interface LeadEntity {
  _id: ObjectId;
  carId: ObjectId;
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

/**
 * Lead creation DTO
 */
export interface CreateLeadDTO {
  carId: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
}

/**
 * Lead update DTO
 */
export interface UpdateLeadDTO {
  status?: 'new' | 'in_progress' | 'closed';
}

