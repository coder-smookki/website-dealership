import { FastifyRequest, FastifyReply } from 'fastify';
import { getCars, getCarById, updateCarStatus, createCar, CarFilters } from '../services/cars.service.js';
import { updateStatusSchema, createCarSchema } from '../utils/validate.js';
import { handleError } from '../utils/errors.js';
import { sendSuccess } from '../utils/response.js';
import { AuthUser } from '../middlewares/auth.js';

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
    return sendSuccess(reply, result);
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function getMyCar(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const car = await getCarById(request.params.id, true);
    return sendSuccess(reply, car);
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
    return sendSuccess(reply, car);
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function createMyCar(
  request: FastifyRequest<{ Body: unknown }>,
  reply: FastifyReply
) {
  try {
    const user = request.user as AuthUser;
    const data = createCarSchema.parse(request.body);
    const car = await createCar(
      { ...data, ownerId: user.id },
      user.id,
      user.role
    );
    return sendSuccess(reply, car, 201);
  } catch (error) {
    return handleError(error, reply);
  }
}

