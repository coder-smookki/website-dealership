import { Db, Collection, ObjectId } from 'mongodb';

// Document interfaces
export interface UserDocument {
  _id: ObjectId;
  email: string;
  passwordHash: string;
  role: 'admin' | 'owner';
  name?: string;
  phone?: string;
  isActive: boolean;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CarDocument {
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

export interface LeadDocument {
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

export interface SettingsDocument {
  _id: ObjectId;
  phone: string;
  email: string;
  address: string;
  workHours: string;
  slogan: string;
  createdAt: Date;
  updatedAt: Date;
}

// Collection getters
export function getUsersCollection(db: Db): Collection<UserDocument> {
  return db.collection<UserDocument>('users');
}

export function getCarsCollection(db: Db): Collection<CarDocument> {
  return db.collection<CarDocument>('cars');
}

export function getLeadsCollection(db: Db): Collection<LeadDocument> {
  return db.collection<LeadDocument>('leads');
}

export function getSettingsCollection(db: Db): Collection<SettingsDocument> {
  return db.collection<SettingsDocument>('settings');
}
