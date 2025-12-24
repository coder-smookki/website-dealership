import type { FastifyRequest, FastifyReply } from 'fastify';
import { getCars, getCarById, updateCarStatus, createCar, CarFilters } from '../services/cars.service.js';
import { sendSuccess } from '../utils/response.js';
import {
  myCarsQuerySchema,
  myCarParamsSchema,
  createMyCarBodySchema,
  updateCarStatusBodySchema,
} from '../schemas/index.js';
import type { z } from 'zod';

type MyCarsQuery = z.infer<typeof myCarsQuerySchema>;
type MyCarParams = z.infer<typeof myCarParamsSchema>;
type CreateMyCarBody = z.infer<typeof createMyCarBodySchema>;
type UpdateCarStatusBody = z.infer<typeof updateCarStatusBodySchema>;

export async function listMyCars(
  request: FastifyRequest<{ Querystring: MyCarsQuery }>,
  reply: FastifyReply
) {
  const user = request.user;
  if (!user) {
    throw new Error('User not authenticated');
  }
  const filters: CarFilters = { ...request.query, ownerId: user.id };
  const result = await getCars(filters);
  return sendSuccess(reply, result);
}

export async function getMyCar(
  request: FastifyRequest<{ Params: MyCarParams }>,
  reply: FastifyReply
) {
  const car = await getCarById(request.params.id, true);
  return sendSuccess(reply, car);
}

export async function updateMyCarStatus(
  request: FastifyRequest<{ Params: MyCarParams; Body: UpdateCarStatusBody }>,
  reply: FastifyReply
) {
  const car = await updateCarStatus(request.params.id, request.body.status);
  return sendSuccess(reply, car);
}

export async function createMyCar(
  request: FastifyRequest<{ Body: CreateMyCarBody }>,
  reply: FastifyReply
) {
  const user = request.user;
  if (!user) {
    throw new Error('User not authenticated');
  }
  const car = await createCar(
    { ...request.body, ownerId: user.id },
    user.id,
    user.role
  );
  return sendSuccess(reply, car, 201);
}
