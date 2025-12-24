import type { FastifyRequest, FastifyReply } from 'fastify';
import { getUserById, updateUser, getUsers } from '../services/users.service.js';
import { sendSuccess } from '../utils/response.js';
import { createUser as createUserService } from '../services/auth.service.js';
import {
  userParamsSchema,
  createUserBodySchema,
  updateUserBodySchema,
} from '../schemas/index.js';
import type { z } from 'zod';

type UserParams = z.infer<typeof userParamsSchema>;
type CreateUserBody = z.infer<typeof createUserBodySchema>;
type UpdateUserBody = z.infer<typeof updateUserBodySchema>;

export async function listUsers(
  request: FastifyRequest<{ Querystring: { role?: 'admin' | 'owner'; isActive?: boolean } }>,
  reply: FastifyReply
) {
  const users = await getUsers(request.query);
  return sendSuccess(reply, users);
}

export async function getUser(
  request: FastifyRequest<{ Params: UserParams }>,
  reply: FastifyReply
) {
  const user = await getUserById(request.params.id);
  return sendSuccess(reply, user);
}

export async function createUserHandler(
  request: FastifyRequest<{ Body: CreateUserBody }>,
  reply: FastifyReply
) {
  const user = await createUserService(
    request.body.email,
    request.body.password,
    request.body.role || 'owner',
    request.body.name,
    request.body.phone
  );
  return sendSuccess(reply, user, 201);
}

export async function updateUserHandler(
  request: FastifyRequest<{ Params: UserParams; Body: UpdateUserBody }>,
  reply: FastifyReply
) {
  const user = await updateUser(request.params.id, request.body);
  return sendSuccess(reply, user);
}
