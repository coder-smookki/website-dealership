import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
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
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ 
    email: normalizedEmail, 
    isActive: true 
  }).select('+passwordHash');
  
  if (!user) {
    throw new UnauthorizedError('Неверный email или пароль');
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw new UnauthorizedError('Неверный email или пароль');
  }

  const tokenPair = await generateTokenPair({
    id: user._id.toString(),
    role: user.role,
    email: user.email,
  });

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
  const normalizedEmail = email.toLowerCase().trim();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    throw new ConflictError('User already exists');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  
  const user = await User.create({
    email: normalizedEmail,
    passwordHash,
    role,
    name,
    phone,
    isActive: true,
  });
  
  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    name: user.name,
    phone: user.phone,
  };
}
