import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { connectDatabase, closeDatabase, getDatabase } from '../db/client.js';
import { getUsersCollection, getCarsCollection, getSettingsCollection, UserDocument, CarDocument, SettingsDocument } from '../db/collections.js';
import { env } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const carsData = JSON.parse(readFileSync(join(__dirname, '../data/cars.json'), 'utf-8'));

async function seedDatabase() {
  await connectDatabase();
  console.log('Connected to MongoDB');

  const db = getDatabase();
  const usersCollection = getUsersCollection(db);
  const carsCollection = getCarsCollection(db);
  const settingsCollection = getSettingsCollection(db);

  // Очищаем существующие данные (опционально)
  const clearData = process.argv[2] === '--clear';
  if (clearData) {
    console.log('Clearing existing data...');
    await carsCollection.deleteMany({});
    await usersCollection.deleteMany({ role: 'owner' });
    await settingsCollection.deleteMany({});
  }

  // Создаем или получаем настройки
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
    
    await settingsCollection.insertOne(defaultSettings as SettingsDocument);
    console.log('Settings created');
  } else {
    console.log('Settings already exist');
  }

  // Создаем владельцев
  const ownerEmails = [
    'owner1@car-shop.ru',
    'owner2@car-shop.ru',
    'owner3@car-shop.ru',
    'owner4@car-shop.ru',
    'owner5@car-shop.ru',
  ];

  const owners = [];
  for (const email of ownerEmails) {
    let owner = await usersCollection.findOne({ email });
    if (!owner) {
      const passwordHash = await bcrypt.hash('owner123', 10);
      const now = new Date();
      
      const ownerData: Omit<UserDocument, '_id'> = {
        email,
        passwordHash,
        role: 'owner',
        name: `Владелец ${email.split('@')[0]}`,
        phone: `+7 9${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      } as Omit<UserDocument, '_id'>;
      
      const result = await usersCollection.insertOne(ownerData as UserDocument);
      owner = { ...ownerData, _id: result.insertedId } as UserDocument;
      console.log(`Owner created: ${email}`);
    }
    owners.push(owner);
  }

  // Создаем автомобили
  const carsCreated = [];
  for (let i = 0; i < carsData.length; i++) {
    const carData = carsData[i];
    const owner = owners[i % owners.length];
    const now = new Date();
    
    const car: Omit<CarDocument, '_id'> = {
      ...carData,
      ownerId: owner._id,
      ownerName: owner.name,
      ownerEmail: owner.email,
      ownerPhone: owner.phone,
      createdBy: owner._id,
      moderationStatus: 'approved',
      createdAt: now,
      updatedAt: now,
    } as Omit<CarDocument, '_id'>;
    
    const result = await carsCollection.insertOne(car as CarDocument);
    carsCreated.push(result.insertedId);
  }

  console.log(`\n✅ Database seeded successfully!`);
  console.log(`   - Settings: created/exists`);
  console.log(`   - Owners: ${owners.length}`);
  console.log(`   - Cars: ${carsCreated.length}`);
  console.log(`\nYou can now use the website with pre-filled data.`);

  await closeDatabase();
  process.exit(0);
}

seedDatabase().catch((error) => {
  console.error('Error seeding database:', error);
  process.exit(1);
});
