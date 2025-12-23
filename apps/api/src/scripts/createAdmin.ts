import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { connectDatabase, closeDatabase, getDatabase } from '../db/client.js';
import { getUsersCollection, UserDocument } from '../db/collections.js';
import { env } from '../config/env.js';

async function createAdmin() {
  await connectDatabase();
  console.log('Connected to MongoDB');

  const email = process.argv[2] || 'admin@example.com';
  const password = process.argv[3] || 'admin123';

  const db = getDatabase();
  const usersCollection = getUsersCollection(db);

  const existing = await usersCollection.findOne({ email });
  if (existing) {
    console.log('Admin user already exists');
    await closeDatabase();
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const now = new Date();
  
  const admin: Omit<UserDocument, '_id'> = {
    email,
    passwordHash,
    role: 'admin',
    name: 'Administrator',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  } as Omit<UserDocument, '_id'>;

  const result = await usersCollection.insertOne(admin as UserDocument);

  console.log('Admin user created successfully!');
  console.log(`ID: ${result.insertedId.toString()}`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log('You can now login at /admin/login');

  await closeDatabase();
  process.exit(0);
}

createAdmin().catch((error) => {
  console.error('Error creating admin:', error);
  process.exit(1);
});
