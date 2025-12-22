import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { User } from '../models/User.js';
import { Car } from '../models/Car.js';
import { Settings } from '../models/Settings.js';
import { env } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const carsData = JSON.parse(readFileSync(join(__dirname, '../data/cars.json'), 'utf-8'));

async function seedDatabase() {
  try {
    await mongoose.connect(env.mongodbUri);
    console.log('Connected to MongoDB');

    // Очищаем существующие данные (опционально)
    const clearData = process.argv[2] === '--clear';
    if (clearData) {
      console.log('Clearing existing data...');
      await Car.deleteMany({});
      await User.deleteMany({ role: 'owner' });
      await Settings.deleteMany({});
    }

    // Создаем или получаем настройки
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        phone: '+7 495 266 7524',
        email: 'info@car-shop.ru',
        address: 'Москва, ул. Примерная, д. 1',
        workHours: 'Пн-Пт: 9:00 - 20:00, Сб-Вс: 10:00 - 18:00',
        slogan: 'SMK Dealership',
      });
      console.log('Settings created');
    } else {
      console.log('Settings already exist');
    }

    // Создаем владельцев (owners) если их нет
    const ownerEmails = [
      'owner1@car-shop.ru',
      'owner2@car-shop.ru',
      'owner3@car-shop.ru',
      'owner4@car-shop.ru',
      'owner5@car-shop.ru',
    ];

    const owners = [];
    for (const email of ownerEmails) {
      let owner = await User.findOne({ email });
      if (!owner) {
        const passwordHash = await bcrypt.hash('owner123', 10);
        owner = await User.create({
          email,
          passwordHash,
          role: 'owner',
          name: `Владелец ${email.split('@')[0]}`,
          phone: `+7 9${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          isActive: true,
        });
        console.log(`Owner created: ${email}`);
      }
      owners.push(owner);
    }

    // Создаем автомобили
    const carsCreated = [];
    for (let i = 0; i < carsData.length; i++) {
      const carData = carsData[i];
      // Распределяем автомобили между владельцами
      const owner = owners[i % owners.length];
      
      const car = await Car.create({
        ...carData,
        ownerId: owner._id,
        createdBy: owner._id,
        moderationStatus: 'approved', // Существующие автомобили одобрены
      });
      carsCreated.push(car);
    }

    console.log(`\n✅ Database seeded successfully!`);
    console.log(`   - Settings: ${settings ? 'created/exists' : 'failed'}`);
    console.log(`   - Owners: ${owners.length}`);
    console.log(`   - Cars: ${carsCreated.length}`);
    console.log(`\nYou can now use the website with pre-filled data.`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();

