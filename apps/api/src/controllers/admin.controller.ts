import { FastifyRequest, FastifyReply } from 'fastify';
import { getUserById, updateUser, getUsers } from '../services/users.service.js';
import { createUserSchema, updateUserSchema } from '../utils/validate.js';
import { handleError } from '../utils/errors.js';
import { sendSuccess } from '../utils/response.js';
import { createUser as createUserService } from '../services/auth.service.js';

export async function listUsers(
  request: FastifyRequest<{ Querystring: { role?: 'admin' | 'owner'; isActive?: boolean } }>,
  reply: FastifyReply
) {
  try {
    const users = await getUsers(request.query);
    return sendSuccess(reply, users);
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
    return sendSuccess(reply, user);
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function createUserHandler(
  request: FastifyRequest<{ Body: unknown }>,
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
    return sendSuccess(reply, user, 201);
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function updateUserHandler(
  request: FastifyRequest<{ Params: { id: string }; Body: unknown }>,
  reply: FastifyReply
) {
  try {
    const data = updateUserSchema.parse(request.body);
    const user = await updateUser(request.params.id, data);
    return sendSuccess(reply, user);
  } catch (error) {
    return handleError(error, reply);
  }
}

