import mongoose from 'mongoose';
import { Settings } from '../models/Settings.js';
import { env } from '../config/env.js';

async function updateSettings() {
  try {
    await mongoose.connect(env.mongodbUri);
    console.log('Connected to MongoDB');

    // Получаем или создаем настройки
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({
        phone: '+7 495 266 7524',
        email: 'info@car-shop.ru',
        address: 'Москва, ул. Примерная, д. 1',
        workHours: 'Пн-Пт: 9:00 - 20:00, Сб-Вс: 10:00 - 18:00',
        slogan: 'SMK Dealership',
      });
      console.log('Settings created with new slogan');
    } else {
      settings.slogan = 'SMK Dealership';
      await settings.save();
      console.log('Settings updated with new slogan');
    }

    console.log(`\n✅ Settings updated successfully!`);
    console.log(`   Slogan: ${settings.slogan}`);

    process.exit(0);
  } catch (error) {
    console.error('Error updating settings:', error);
    process.exit(1);
  }
}

updateSettings();

