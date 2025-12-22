import { FastifyRequest, FastifyReply } from 'fastify';
import { Car } from '../models/Car.js';
import { AuthUser } from './auth.js';

export async function canAccessCar(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const user = request.user as AuthUser | undefined;
  
  if (!user) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }

  // Admin может всё
  if (user.role === 'admin') {
    return;
  }

  // Owner может только свои объявления
  const car = await Car.findById(request.params.id);
  if (!car) {
    return reply.code(404).send({ error: 'Car not found' });
  }

  if (car.ownerId.toString() !== user.id) {
    return reply.code(403).send({ error: 'Forbidden' });
  }
}

