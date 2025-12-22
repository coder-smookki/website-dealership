import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { AppError } from '../utils/errors.js';

export async function loginUser(email: string, password: string) {
  // Поиск без учета регистра
  const user = await User.findOne({ 
    email: email.toLowerCase().trim(), 
    isActive: true 
  });
  if (!user) {
    throw new AppError(401, 'Неверный email или пароль');
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw new AppError(401, 'Неверный email или пароль');
  }

  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    name: user.name,
  };
}

export async function createUser(
  email: string,
  password: string,
  role: 'admin' | 'owner',
  name?: string,
  phone?: string
) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError(409, 'User already exists');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    email,
    passwordHash,
    role,
    name,
    phone,
  });

  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    name: user.name,
    phone: user.phone,
  };
}

