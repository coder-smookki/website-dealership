import { Settings } from '../models/Settings.js';

export async function getSettings() {
  let settings = await Settings.findOne().lean();
  if (!settings) {
    settings = (await Settings.create({})).toObject();
  }
  return settings;
}

export async function updateSettings(data: {
  phone?: string;
  email?: string;
  address?: string;
  workHours?: string;
  slogan?: string;
}) {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create(data);
  } else {
    Object.assign(settings, data);
    await settings.save();
  }
  return settings;
}

