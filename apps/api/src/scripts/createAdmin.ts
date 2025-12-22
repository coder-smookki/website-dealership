import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { env } from '../config/env.js';

async function createAdmin() {
  try {
    await mongoose.connect(env.mongodbUri);
    console.log('Connected to MongoDB');

    const email = process.argv[2] || 'admin@example.com';
    const password = process.argv[3] || 'admin123';

    const existing = await User.findOne({ email });
    if (existing) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const admin = await User.create({
      email,
      passwordHash,
      role: 'admin',
      name: 'Administrator',
      isActive: true,
    });

    console.log('Admin user created successfully!');
    console.log(`Email: ${admin.email}`);
    console.log(`Password: ${password}`);
    console.log('You can now login at /admin/login');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();

