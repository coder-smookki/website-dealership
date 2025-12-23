import { FastifyRequest, FastifyReply } from 'fastify';
import { getUserById, updateUser, getUsers } from '../services/users.service.js';
import { createUserSchema, updateUserSchema } from '../utils/validate.js';
import { ValidationError } from '../utils/errors.js';
import { sendSuccess } from '../utils/response.js';
import { createUser as createUserService } from '../services/auth.service.js';

export async function listUsers(
  request: FastifyRequest<{ Querystring: { role?: 'admin' | 'owner'; isActive?: boolean } }>,
  reply: FastifyReply
) {
  const users = await getUsers(request.query);
  return sendSuccess(reply, users);
}

export async function getUser(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const user = await getUserById(request.params.id);
  return sendSuccess(reply, user);
}

export async function createUserHandler(
  request: FastifyRequest<{ Body: unknown }>,
  reply: FastifyReply
) {
  const validated = createUserSchema.safeParse(request.body);
  if (!validated.success) {
    throw new ValidationError(validated.error.errors[0]?.message || 'Invalid input');
  }
  const user = await createUserService(
    validated.data.email,
    validated.data.password,
    validated.data.role || 'owner',
    validated.data.name,
    validated.data.phone
  );
  return sendSuccess(reply, user, 201);
}

export async function updateUserHandler(
  request: FastifyRequest<{ Params: { id: string }; Body: unknown }>,
  reply: FastifyReply
) {
  const validated = updateUserSchema.safeParse(request.body);
  if (!validated.success) {
    throw new ValidationError(validated.error.errors[0]?.message || 'Invalid input');
  }
  const user = await updateUser(request.params.id, validated.data);
  return sendSuccess(reply, user);
}
