import { Settings } from '../models/Settings.js';

export async function getSettings() {
  let settings = await Settings.findOne().lean();
  
  if (!settings) {
    settings = await Settings.create({});
  }
  
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

export async function updateSettings(data: {
  phone?: string;
  email?: string;
  address?: string;
  workHours?: string;
  slogan?: string;
}) {
  let settings = await Settings.findOne();
  
  if (!settings) {
    settings = await Settings.create({
      phone: data.phone || '+7 495 266 7524',
      email: data.email || 'info@car-shop.ru',
      address: data.address || 'Москва, ул. Примерная, д. 1',
      workHours: data.workHours || 'Пн-Пт: 9:00 - 20:00, Сб-Вс: 10:00 - 18:00',
      slogan: data.slogan || 'SMK Dealership',
    });
  } else {
    const updateData: Record<string, unknown> = {};
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.workHours !== undefined) updateData.workHours = data.workHours;
    if (data.slogan !== undefined) updateData.slogan = data.slogan;
    
    settings = await Settings.findOneAndUpdate(
      {},
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }
  
  if (!settings) {
    throw new Error('Failed to update settings');
  }
  
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
