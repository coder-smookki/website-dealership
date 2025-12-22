import { FastifyRequest, FastifyReply } from 'fastify';
import { getUserById, updateUser, getUsers } from '../services/users.service.js';
import { createUserSchema, updateUserSchema } from '../utils/validate.js';
import { handleError } from '../utils/errors.js';
import { createUser as createUserService } from '../services/auth.service.js';
import bcrypt from 'bcryptjs';

export async function listUsers(
  request: FastifyRequest<{ Querystring: { role?: 'admin' | 'owner'; isActive?: boolean } }>,
  reply: FastifyReply
) {
  try {
    const users = await getUsers(request.query);
    return reply.send(users);
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function getUser(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const user = await getUserById(request.params.id);
    return reply.send(user);
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function createUserHandler(
  request: FastifyRequest<{ Body: any }>,
  reply: FastifyReply
) {
  try {
    const data = createUserSchema.parse(request.body);
    const user = await createUserService(
      data.email,
      data.password,
      data.role || 'owner',
      data.name,
      data.phone
    );
    return reply.code(201).send(user);
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function updateUserHandler(
  request: FastifyRequest<{ Params: { id: string }; Body: any }>,
  reply: FastifyReply
) {
  try {
    const data = updateUserSchema.parse(request.body);
    const user = await updateUser(request.params.id, data);
    return reply.send(user);
  } catch (error) {
    return handleError(error, reply);
  }
}

