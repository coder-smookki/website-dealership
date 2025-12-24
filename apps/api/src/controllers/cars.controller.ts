import type { FastifyRequest, FastifyReply } from 'fastify';
import {
  getCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
  updateCarStatus,
  moderateCar,
} from '../services/cars.service.js';
import { sendSuccess } from '../utils/response.js';
import {
  carFiltersQuerySchema,
  carParamsSchema,
  createCarBodySchema,
  updateCarBodySchema,
  moderateCarBodySchema,
  updateCarStatusBodySchema,
} from '../schemas/index.js';
import type { z } from 'zod';

type CarFiltersQuery = z.infer<typeof carFiltersQuerySchema>;
type CarParams = z.infer<typeof carParamsSchema>;
type CreateCarBody = z.infer<typeof createCarBodySchema>;
type UpdateCarBody = z.infer<typeof updateCarBodySchema>;
type ModerateCarBody = z.infer<typeof moderateCarBodySchema>;
type UpdateCarStatusBody = z.infer<typeof updateCarStatusBodySchema>;

export async function listCars(
  request: FastifyRequest<{ Querystring: CarFiltersQuery }>,
  reply: FastifyReply
) {
  const result = await getCars(request.query);
  return sendSuccess(reply, result);
}

export async function getCar(
  request: FastifyRequest<{ Params: CarParams }>,
  reply: FastifyReply
) {
  const user = request.user;
  const includePending = user?.role === 'admin';
  const car = await getCarById(request.params.id, includePending);
  return sendSuccess(reply, car);
}

export async function createCarHandler(
  request: FastifyRequest<{ Body: CreateCarBody }>,
  reply: FastifyReply
) {
  const user = request.user;
  if (!user) {
    throw new Error('User not authenticated');
  }
  const car = await createCar(request.body, user.id, user.role);
  return sendSuccess(reply, car, 201);
}

export async function updateCarHandler(
  request: FastifyRequest<{ Params: CarParams; Body: UpdateCarBody }>,
  reply: FastifyReply
) {
  const car = await updateCar(request.params.id, request.body);
  return sendSuccess(reply, car);
}

export async function deleteCarHandler(
  request: FastifyRequest<{ Params: CarParams }>,
  reply: FastifyReply
) {
  await deleteCar(request.params.id);
  return sendSuccess(reply, { success: true });
}

export async function updateCarStatusHandler(
  request: FastifyRequest<{ Params: CarParams; Body: UpdateCarStatusBody }>,
  reply: FastifyReply
) {
  const car = await updateCarStatus(request.params.id, request.body.status);
  return sendSuccess(reply, car);
}

export async function moderateCarHandler(
  request: FastifyRequest<{ Params: CarParams; Body: ModerateCarBody }>,
  reply: FastifyReply
) {
  const { moderationStatus, moderationComment } = request.body;
  const car = await moderateCar(request.params.id, moderationStatus, moderationComment);
  return sendSuccess(reply, car);
}
