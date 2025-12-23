import { ObjectId } from 'mongodb';
import { getDatabase } from '../db/client.js';
import { getUsersCollection, UserDocument } from '../db/collections.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';

interface UserResponse {
  id: string;
  email: string;
  role: 'admin' | 'owner';
  name?: string;
  phone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function mapUserToResponse(user: UserDocument): UserResponse {
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

export async function getUsers(filters: { role?: 'admin' | 'owner'; isActive?: boolean } = {}) {
  const db = getDatabase();
  const usersCollection = getUsersCollection(db);
  
  const query: Record<string, unknown> = {};
  if (filters.role) query.role = filters.role;
  if (filters.isActive !== undefined) query.isActive = filters.isActive;

  const users = await usersCollection
    .find(query, { projection: { passwordHash: 0, refreshToken: 0 } })
    .sort({ createdAt: -1 })
    .toArray();

  return users.map(mapUserToResponse);
}

export async function getUserById(id: string): Promise<UserResponse> {
  if (!ObjectId.isValid(id)) throw new ValidationError('Invalid user ID');
  
  const db = getDatabase();
  const usersCollection = getUsersCollection(db);
  const user = await usersCollection.findOne(
    { _id: new ObjectId(id) },
    { projection: { passwordHash: 0, refreshToken: 0 } }
  );
  
  if (!user) throw new NotFoundError('User');
  
  return mapUserToResponse(user);
}

export async function updateUser(
  id: string,
  data: { name?: string; phone?: string; isActive?: boolean }
): Promise<UserResponse> {
  if (!ObjectId.isValid(id)) throw new ValidationError('Invalid user ID');
  
  const db = getDatabase();
  const usersCollection = getUsersCollection(db);
  
  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (data.name !== undefined) updateData.name = data.name;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  
  const result = await usersCollection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updateData },
    { returnDocument: 'after', projection: { passwordHash: 0, refreshToken: 0 } }
  );
  
  if (!result) throw new NotFoundError('User');
  
  return mapUserToResponse(result);
}
