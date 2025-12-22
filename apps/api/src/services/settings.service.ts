import { Settings } from '../models/Settings.js';

export async function getSettings(): Promise<any> {
  const existing = await Settings.findOne().lean();
  let settings: any = existing;
  if (!settings) {
    settings = (await Settings.create({})).toObject();
  }
  return settings as any;
}

export async function updateSettings(data: {
  phone?: string;
  email?: string;
  address?: string;
  workHours?: string;
  slogan?: string;
}): Promise<any> {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create(data);
  } else {
    Object.assign(settings, data);
    await settings.save();
  }
  return settings as any;
}