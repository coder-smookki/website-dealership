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
import { handleError } from '../utils/errors.js';
import type { AuthUser } from '../types/fastify.js';

export async function listCars(
  request: FastifyRequest<{ Querystring: CarFilters }>,
  reply: FastifyReply
) {
  try {
    const result = await getCars(request.query);
    return reply.send(result);
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function getCar(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    // Для админа показываем все объявления, для публичных - только approved
    const user = request.user as AuthUser | undefined;
    const includePending = user?.role === 'admin';
    const car = await getCarById(request.params.id, includePending);
    return reply.send(car);
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function createCarHandler(
  request: FastifyRequest<{ Body: any }>,
  reply: FastifyReply
) {
  try {
    const user = request.user as AuthUser;
    const data = createCarSchema.parse(request.body);
    const car = await createCar(data, user.id, user.role);
    return reply.code(201).send(car);
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function updateCarHandler(
  request: FastifyRequest<{ Params: { id: string }; Body: any }>,
  reply: FastifyReply
) {
  try {
    const data = updateCarSchema.parse(request.body);
    const car = await updateCar(request.params.id, data);
    return reply.send(car);
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function deleteCarHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    await deleteCar(request.params.id);
    return reply.code(204).send();
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function updateCarStatusHandler(
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
  try {
    const { moderationStatus, moderationComment } = request.body;
    const car = await moderateCar(request.params.id, moderationStatus, moderationComment);
    return reply.send(car);
  } catch (error) {
    return handleError(error, reply);
  }
}

