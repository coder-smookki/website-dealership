import { FastifyRequest, FastifyReply } from 'fastify';
import { getCars, getCarById, updateCarStatus, createCar, CarFilters } from '../services/cars.service.js';
import { updateStatusSchema, createCarSchema } from '../utils/validate.js';
import { ValidationError } from '../utils/errors.js';
import { sendSuccess } from '../utils/response.js';
import { AuthUser } from '../middlewares/auth.js';

export async function listMyCars(
  request: FastifyRequest<{ Querystring: CarFilters }>,
  reply: FastifyReply
) {
  const user = request.user as AuthUser;
  const filters = { ...request.query, ownerId: user.id };
  const result = await getCars(filters);
  return sendSuccess(reply, result);
}

export async function getMyCar(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const car = await getCarById(request.params.id, true);
  return sendSuccess(reply, car);
}

export async function updateMyCarStatus(
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

export async function createMyCar(
  request: FastifyRequest<{ Body: unknown }>,
  reply: FastifyReply
) {
  const user = request.user as AuthUser;
  const validated = createCarSchema.safeParse(request.body);
  if (!validated.success) {
    throw new ValidationError(validated.error.errors[0]?.message || 'Invalid input');
  }
  const car = await createCar(
    { ...validated.data, ownerId: user.id },
    user.id,
    user.role
  );
  return sendSuccess(reply, car, 201);
}
