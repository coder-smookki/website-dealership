import { User } from '../models/User.js';
import { AppError } from '../utils/errors.js';
import { Types } from 'mongoose';

export async function getUsers(filters: { role?: 'admin' | 'owner'; isActive?: boolean } = {}) {
  const query: any = {};
  
  if (filters.role) {
    query.role = filters.role;
  }
  
  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive;
  }

  const users = await User.find(query)
    .select('-passwordHash')
    .sort({ createdAt: -1 })
    .lean();

  return users;
}

export async function getUserById(id: string) {
  const user = await User.findById(id).select('-passwordHash').lean();
  if (!user) {
    throw new AppError(404, 'User not found');
  }
  return user;
}

export async function updateUser(id: string, data: { name?: string; phone?: string; isActive?: boolean }) {
  const user = await User.findByIdAndUpdate(id, data, { new: true })
    .select('-passwordHash');
  
  if (!user) {
    throw new AppError(404, 'User not found');
  }
  
  return user;
}

