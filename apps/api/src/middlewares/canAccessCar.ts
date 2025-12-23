import { FastifyRequest, FastifyReply } from 'fastify';
import { ObjectId } from 'mongodb';
import { getDatabase } from '../db/client.js';
import { getCarsCollection } from '../db/collections.js';
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
  if (!ObjectId.isValid(request.params.id)) {
    return reply.code(404).send({ error: 'Car not found' });
  }

  const db = getDatabase();
  const carsCollection = getCarsCollection(db);
  const car = await carsCollection.findOne({ _id: new ObjectId(request.params.id) });
  
  if (!car) {
    return reply.code(404).send({ error: 'Car not found' });
  }

  if (car.ownerId.toString() !== user.id) {
    return reply.code(403).send({ error: 'Forbidden' });
  }
}

