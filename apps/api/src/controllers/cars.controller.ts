import { FastifyRequest, FastifyReply } from 'fastify';
import {
  getCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
  updateCarStatus,
  moderateCar,
  CarFilters,
} from '../services/cars.service.js';
import { createCarSchema, updateCarSchema, updateStatusSchema } from '../utils/validate.js';
import { ValidationError } from '../utils/errors.js';
import { sendSuccess } from '../utils/response.js';
import { AuthUser } from '../middlewares/auth.js';

export async function listCars(
  request: FastifyRequest<{ Querystring: CarFilters }>,
  reply: FastifyReply
) {
  const result = await getCars(request.query);
  return sendSuccess(reply, result);
}

export async function getCar(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const user = request.user as AuthUser | undefined;
  const includePending = user?.role === 'admin';
  const car = await getCarById(request.params.id, includePending);
  return sendSuccess(reply, car);
}

export async function createCarHandler(
  request: FastifyRequest<{ Body: unknown }>,
  reply: FastifyReply
) {
  const user = request.user as AuthUser;
  const validated = createCarSchema.safeParse(request.body);
  if (!validated.success) {
    throw new ValidationError(validated.error.errors[0]?.message || 'Invalid input');
  }
  const car = await createCar(validated.data, user.id, user.role);
  return sendSuccess(reply, car, 201);
}

export async function updateCarHandler(
  request: FastifyRequest<{ Params: { id: string }; Body: unknown }>,
  reply: FastifyReply
) {
  const validated = updateCarSchema.safeParse(request.body);
  if (!validated.success) {
    throw new ValidationError(validated.error.errors[0]?.message || 'Invalid input');
  }
  const car = await updateCar(request.params.id, validated.data);
  return sendSuccess(reply, car);
}

export async function deleteCarHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  await deleteCar(request.params.id);
  return sendSuccess(reply, { success: true });
}

export async function updateCarStatusHandler(
  request: FastifyRequest<{ Params: { id: string }; Body: { status: 'available' | 'reserved' | 'sold' } }>,
  reply: FastifyReply
) {
  const validated = updateStatusSchema.safeParse(request.body);
  if (!validated.success) {
    throw new ValidationError(validated.error.errors[0]?.message || 'Invalid input');
  }
  const car = await updateCarStatus(request.params.id, validated.data.status);
  return sendSuccess(reply, car);
}

export async function moderateCarHandler(
  request: FastifyRequest<{ 
    Params: { id: string }; 
    Body: { 
      moderationStatus: 'approved' | 'rejected';
      moderationComment?: string;
    } 
  }>,
  reply: FastifyReply
) {
  const { moderationStatus, moderationComment } = request.body;
  const car = await moderateCar(request.params.id, moderationStatus, moderationComment);
  return sendSuccess(reply, car);
}
