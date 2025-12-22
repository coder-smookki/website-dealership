import { FastifyRequest, FastifyReply } from 'fastify';
import { getCars, getCarById, updateCarStatus, createCar, CarFilters } from '../services/cars.service.js';
import { updateStatusSchema, createCarSchema } from '../utils/validate.js';
import { handleError } from '../utils/errors.js';
import type { AuthUser } from '../types/fastify.js';

export async function listMyCars(
  request: FastifyRequest<{ Querystring: CarFilters }>,
  reply: FastifyReply
) {
  try {
    const user = request.user as AuthUser;
    const filters = {
      ...request.query,
      ownerId: user.id,
    };
    const result = await getCars(filters);
    return reply.send(result);
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function getMyCar(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    // Владелец может видеть свои объявления независимо от статуса модерации
    const car = await getCarById(request.params.id, true);
    return reply.send(car);
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function updateMyCarStatus(
  request: FastifyRequest<{ Params: { id: string }; Body: { status: 'available' | 'reserved' | 'sold' } }>,
  reply: FastifyReply
) {
  try {
    const data = updateStatusSchema.parse(request.body);
    const car = await updateCarStatus(request.params.id, data.status);
    return reply.send(car);
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function createMyCar(
  request: FastifyRequest<{ Body: any }>,
  reply: FastifyReply
) {
  try {
    const user = request.user as AuthUser;
    const data = createCarSchema.parse(request.body);
    // Устанавливаем ownerId на текущего пользователя
    const car = await createCar(
      { ...data, ownerId: user.id },
      user.id,
      user.role
    );
    return reply.code(201).send(car);
  } catch (error) {
    return handleError(error, reply);
  }
}

