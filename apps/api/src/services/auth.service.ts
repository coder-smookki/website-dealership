import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { getDatabase } from '../db/client.js';
import { getUsersCollection, UserDocument } from '../db/collections.js';
import { UnauthorizedError, ConflictError } from '../utils/errors.js';
import { generateTokenPair } from './token.service.js';

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: 'admin' | 'owner';
    name?: string;
  };
}

export interface CreateUserResult {
  id: string;
  email: string;
  role: 'admin' | 'owner';
  name?: string;
  phone?: string;
}

export async function loginUser(email: string, password: string): Promise<LoginResult> {
  const db = getDatabase();
  const usersCollection = getUsersCollection(db);
  
  const normalizedEmail = email.toLowerCase().trim();
  const user = await usersCollection.findOne({ 
    email: normalizedEmail, 
    isActive: true 
  });
  
  if (!user) {
    throw new UnauthorizedError('Неверный email или пароль');
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw new UnauthorizedError('Неверный email или пароль');
  }

  const tokenPair = await generateTokenPair(user._id.toString());

  return {
    ...tokenPair,
    user: {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    },
  };
}

export async function createUser(
  email: string,
  password: string,
  role: 'admin' | 'owner',
  name?: string,
  phone?: string
): Promise<CreateUserResult> {
  const db = getDatabase();
  const usersCollection = getUsersCollection(db);
  
  const normalizedEmail = email.toLowerCase().trim();
  const existing = await usersCollection.findOne({ email: normalizedEmail });
  if (existing) {
    throw new ConflictError('User already exists');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const now = new Date();
  
  const user: Omit<UserDocument, '_id'> = {
    email: normalizedEmail,
    passwordHash,
    role,
    name,
    phone,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  } as Omit<UserDocument, '_id'>;

  const result = await usersCollection.insertOne(user as UserDocument);
  
  return {
    id: result.insertedId.toString(),
    email: user.email,
    role: user.role,
    name: user.name,
    phone: user.phone,
  };
}
