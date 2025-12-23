import { Types } from 'mongoose';
import { User } from '../models/User.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';

export async function getUsers(filters: { role?: 'admin' | 'owner'; isActive?: boolean } = {}) {
  const query: Record<string, unknown> = {};
  
  if (filters.role) {
    query.role = filters.role;
  }
  
  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive;
  }

  const users = await User.find(query)
    .select('-passwordHash -refreshToken')
    .sort({ createdAt: -1 })
    .lean();

  return users.map(user => ({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    name: user.name,
    phone: user.phone,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }));
}

export async function getUserById(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new ValidationError('Invalid user ID');
  }
  
  const user = await User.findById(id)
    .select('-passwordHash -refreshToken')
    .lean();
  
  if (!user) {
    throw new NotFoundError('User');
  }
  
  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    name: user.name,
    phone: user.phone,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function updateUser(id: string, data: { name?: string; phone?: string; isActive?: boolean }) {
  if (!Types.ObjectId.isValid(id)) {
    throw new ValidationError('Invalid user ID');
  }
  
  const updateData: Record<string, unknown> = {};
  
  if (data.name !== undefined) updateData.name = data.name;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  
  const user = await User.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  )
    .select('-passwordHash -refreshToken')
    .lean();
  
  if (!user) {
    throw new NotFoundError('User');
  }
  
  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    name: user.name,
    phone: user.phone,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
