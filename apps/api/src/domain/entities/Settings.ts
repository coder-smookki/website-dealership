import { ObjectId } from 'mongodb';
export interface SettingsEntity {
  _id: ObjectId;
  phone: string;
  email: string;
  address: string;
  workHours: string;
  slogan: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateSettingsDTO {
  phone?: string;
  email?: string;
  address?: string;
  workHours?: string;
  slogan?: string;
}

