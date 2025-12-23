import { Db, Collection } from 'mongodb';
import { UserEntity } from '../domain/entities/User.js';
import { CarEntity } from '../domain/entities/Car.js';
import { LeadEntity } from '../domain/entities/Lead.js';
import { SettingsEntity } from '../domain/entities/Settings.js';

// Re-export entities as documents for backward compatibility
export type UserDocument = UserEntity;
export type CarDocument = CarEntity;
export type LeadDocument = LeadEntity;
export type SettingsDocument = SettingsEntity;

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
