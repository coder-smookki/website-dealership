import { ObjectId } from 'mongodb';
export interface CarEntity {
  _id: ObjectId;
  title: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  currency: string;
  fuelType: string;
  transmission: string;
  drive: string;
  engine: string;
  powerHp: number;
  color: string;
  description: string;
  features: string[];
  images: string[];
  status: 'available' | 'reserved' | 'sold';
  moderationStatus: 'pending' | 'approved' | 'rejected';
  moderationComment?: string;
  ownerId: ObjectId;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCarDTO {
  title: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  currency: string;
  fuelType: string;
  transmission: string;
  drive: string;
  engine: string;
  powerHp: number;
  color: string;
  description: string;
  features: string[];
  images: string[];
  ownerId: string;
}

export interface UpdateCarDTO {
  title?: string;
  brand?: string;
  model?: string;
  year?: number;
  mileage?: number;
  price?: number;
  currency?: string;
  fuelType?: string;
  transmission?: string;
  drive?: string;
  engine?: string;
  powerHp?: number;
  color?: string;
  description?: string;
  features?: string[];
  images?: string[];
  status?: 'available' | 'reserved' | 'sold';
}

export interface CarFiltersDTO {
  q?: string;
  brand?: string;
  yearFrom?: number;
  yearTo?: number;
  priceFrom?: number;
  priceTo?: number;
  fuelType?: string;
  transmission?: string;
  drive?: string;
  status?: 'available' | 'reserved' | 'sold';
  moderationStatus?: 'pending' | 'approved' | 'rejected';
  ownerId?: string;
}

