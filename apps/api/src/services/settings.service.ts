import type { UpdateFilter } from 'mongodb';
import { getDatabase } from '../db/client.js';
import { getSettingsCollection, SettingsDocument } from '../db/collections.js';

interface SettingsResponse {
  _id: string;
  phone: string;
  email: string;
  address: string;
  workHours: string;
  slogan: string;
  createdAt: Date;
  updatedAt: Date;
}

function mapSettingsToResponse(settings: SettingsDocument): SettingsResponse {
  return {
    _id: settings._id.toString(),
    phone: settings.phone,
    email: settings.email,
    address: settings.address,
    workHours: settings.workHours,
    slogan: settings.slogan,
    createdAt: settings.createdAt,
    updatedAt: settings.updatedAt,
  };
}

export async function getSettings(): Promise<SettingsResponse> {
  const db = getDatabase();
  const settingsCollection = getSettingsCollection(db);
  
  let settings = await settingsCollection.findOne();
  
  if (!settings) {
    const now = new Date();
    const defaultSettings: Omit<SettingsDocument, '_id'> = {
      phone: '+7 495 266 7524',
      email: 'info@car-shop.ru',
      address: 'Москва, ул. Примерная, д. 1',
      workHours: 'Пн-Пт: 9:00 - 20:00, Сб-Вс: 10:00 - 18:00',
      slogan: 'SMK Dealership',
      createdAt: now,
      updatedAt: now,
    } as Omit<SettingsDocument, '_id'>;
    
    const result = await settingsCollection.insertOne(defaultSettings as SettingsDocument);
    settings = { ...defaultSettings, _id: result.insertedId } as SettingsDocument;
  }
  
  return mapSettingsToResponse(settings);
}

export async function updateSettings(data: {
  phone?: string;
  email?: string;
  address?: string;
  workHours?: string;
  slogan?: string;
}): Promise<SettingsResponse> {
  const db = getDatabase();
  const settingsCollection = getSettingsCollection(db);
  
  let settings = await settingsCollection.findOne();
  
  const updateData: UpdateFilter<SettingsDocument> = {
    $set: {
      ...data,
      updatedAt: new Date(),
    },
  };
  
  if (!settings) {
    const now = new Date();
    const defaultSettings: Omit<SettingsDocument, '_id'> = {
      phone: data.phone || '+7 495 266 7524',
      email: data.email || 'info@car-shop.ru',
      address: data.address || 'Москва, ул. Примерная, д. 1',
      workHours: data.workHours || 'Пн-Пт: 9:00 - 20:00, Сб-Вс: 10:00 - 18:00',
      slogan: data.slogan || 'SMK Dealership',
      createdAt: now,
      updatedAt: now,
    } as Omit<SettingsDocument, '_id'>;
    
    const result = await settingsCollection.insertOne(defaultSettings as SettingsDocument);
    settings = { ...defaultSettings, _id: result.insertedId } as SettingsDocument;
  } else {
    const result = await settingsCollection.findOneAndUpdate(
      {},
      updateData,
      { returnDocument: 'after' }
    );
    if (result) settings = result;
  }
  
  return mapSettingsToResponse(settings);
}
