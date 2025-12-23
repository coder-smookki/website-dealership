import { z } from 'zod';

// Упрощенные схемы валидации - только базовые проверки
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  phone: z.string().min(1),
});

export const createCarSchema = z.object({
  title: z.string().min(1),
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(1900),
  mileage: z.number().min(0),
  price: z.number().min(0),
  currency: z.string().optional(),
  fuelType: z.string().min(1),
  transmission: z.string().min(1),
  drive: z.string().min(1),
  engine: z.string().min(1),
  powerHp: z.number().min(0),
  color: z.string().min(1),
  description: z.string().min(1),
  features: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  status: z.enum(['available', 'reserved', 'sold']).optional(),
  ownerId: z.string().min(1),
});

export const updateCarSchema = createCarSchema.partial();

export const createLeadSchema = z.object({
  carId: z.string().min(1),
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
  role: z.enum(['admin', 'owner']).optional(),
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
