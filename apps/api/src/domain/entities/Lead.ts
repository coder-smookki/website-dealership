import { ObjectId } from 'mongodb';
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

export interface CreateLeadDTO {
  carId: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
}

export interface UpdateLeadDTO {
  status?: 'new' | 'in_progress' | 'closed';
}

