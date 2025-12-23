import { ObjectId } from 'mongodb';

/**
 * Domain Entity - Settings
 * Represents dealership settings
 */
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

/**
 * Settings update DTO
 */
export interface UpdateSettingsDTO {
  phone?: string;
  email?: string;
  address?: string;
  workHours?: string;
  slogan?: string;
}

