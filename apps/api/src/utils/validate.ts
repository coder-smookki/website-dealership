import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  phone: z.string().min(10, 'Некорректный номер телефона'),
});

export const createCarSchema = z.object({
  title: z.string().min(1),
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  mileage: z.number().min(0),
  price: z.number().min(0),
  currency: z.string().default('RUB'),
  fuelType: z.string().min(1),
  transmission: z.string().min(1),
  drive: z.string().min(1),
  engine: z.string().min(1),
  powerHp: z.number().min(0),
  color: z.string().min(1),
  description: z.string().min(1),
  features: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  status: z.enum(['available', 'reserved', 'sold']).default('available'),
  ownerId: z.string().regex(/^[0-9a-fA-F]{24}$/),
});

export const updateCarSchema = createCarSchema.partial();

export const createLeadSchema = z.object({
  carId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional(),
  message: z.string().optional(),
});

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
  phone: z.string().optional(),
  role: z.enum(['admin', 'owner']).default('owner'),
});

export const updateUserSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const updateSettingsSchema = z.object({
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  workHours: z.string().optional(),
  slogan: z.string().optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(['available', 'reserved', 'sold']),
});

export const updateLeadStatusSchema = z.object({
  status: z.enum(['new', 'in_progress', 'closed']),
});

