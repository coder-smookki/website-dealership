import { connectDatabase, closeDatabase, getDatabase } from '../db/client.js';
import { getSettingsCollection, SettingsDocument } from '../db/collections.js';
import { env } from '../config/env.js';

async function updateSettings() {
  await connectDatabase();
  console.log('Connected to MongoDB');

  const db = getDatabase();
  const settingsCollection = getSettingsCollection(db);

  // Получаем или создаем настройки
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
    console.log('Settings created with new slogan');
  } else {
    const result = await settingsCollection.findOneAndUpdate(
      {},
      { $set: { slogan: 'SMK Dealership', updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    settings = result || settings;
    console.log('Settings updated with new slogan');
  }

  console.log(`\n✅ Settings updated successfully!`);
  console.log(`   Slogan: ${settings.slogan}`);

  await closeDatabase();
  process.exit(0);
}

updateSettings().catch((error) => {
  console.error('Error updating settings:', error);
  process.exit(1);
});
