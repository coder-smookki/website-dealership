import { z } from 'zod';

export const carStatusSchema = z.enum(['available', 'reserved', 'sold']);
export const moderationStatusSchema = z.enum(['pending', 'approved', 'rejected']);
export const leadStatusSchema = z.enum(['new', 'in_progress', 'closed']);
export const userRoleSchema = z.enum(['admin', 'owner']);

export const carFiltersQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  q: z.string().optional(),
  brand: z.string().optional(),
  yearFrom: z.coerce.number().int().optional(),
  yearTo: z.coerce.number().int().optional(),
  priceFrom: z.coerce.number().optional(),
  priceTo: z.coerce.number().optional(),
  fuelType: z.string().optional(),
  transmission: z.string().optional(),
  drive: z.string().optional(),
  status: carStatusSchema.optional(),
  moderationStatus: moderationStatusSchema.optional(),
  sort: z.string().optional(),
});

export const carParamsSchema = z.object({
  id: z.string().min(1),
});

export const createCarBodySchema = z.object({
  title: z.string().min(1),
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(1900),
  mileage: z.number().min(0),
  price: z.number().min(0),
  currency: z.string().optional().default('RUB'),
  fuelType: z.string().min(1),
  transmission: z.string().min(1),
  drive: z.string().min(1),
  engine: z.string().min(1),
  powerHp: z.number().min(0),
  color: z.string().min(1),
  description: z.string().min(1),
  features: z.array(z.string()).optional().default([]),
  images: z.array(z.string()).optional().default([]),
  status: carStatusSchema.optional().default('available'),
  ownerId: z.string().min(1),
});

export const updateCarBodySchema = createCarBodySchema.partial();

export const moderateCarBodySchema = z.object({
  moderationStatus: z.enum(['approved', 'rejected']),
  moderationComment: z.string().optional(),
});

export const updateCarStatusBodySchema = z.object({
  status: carStatusSchema,
});

export const registerBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  phone: z.string().min(1),
});

export const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshTokenBodySchema = z.object({
  refreshToken: z.string().min(1),
});

export const createLeadBodySchema = z.object({
  carId: z.string().min(1),
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional(),
  message: z.string().optional(),
});

export const leadParamsSchema = z.object({
  id: z.string().min(1),
});

export const updateLeadStatusBodySchema = z.object({
  status: leadStatusSchema,
});

export const createUserBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
  phone: z.string().optional(),
  role: userRoleSchema.optional().default('owner'),
});

export const userParamsSchema = z.object({
  id: z.string().min(1),
});

export const updateUserBodySchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const updateSettingsBodySchema = z.object({
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  workHours: z.string().optional(),
  slogan: z.string().optional(),
});

export const myCarsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: carStatusSchema.optional(),
  sort: z.string().optional(),
});

export const myCarParamsSchema = z.object({
  id: z.string().min(1),
});

export const createMyCarBodySchema = createCarBodySchema.omit({ ownerId: true });

