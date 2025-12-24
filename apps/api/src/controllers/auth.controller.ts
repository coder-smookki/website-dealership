import type { FastifyRequest, FastifyReply } from 'fastify';
import { ObjectId } from 'mongodb';
import { loginUser, createUser } from '../services/auth.service.js';
import { refreshAccessToken, revokeRefreshToken, generateTokenPair } from '../services/token.service.js';
import { UnauthorizedError, NotFoundError } from '../utils/errors.js';
import { sendSuccess } from '../utils/response.js';
import { getDatabase } from '../db/client.js';
import { getUsersCollection } from '../db/collections.js';
import {
  loginBodySchema,
  registerBodySchema,
  refreshTokenBodySchema,
} from '../schemas/index.js';
import type { z } from 'zod';

type LoginBody = z.infer<typeof loginBodySchema>;
type RegisterBody = z.infer<typeof registerBodySchema>;
type RefreshTokenBody = z.infer<typeof refreshTokenBodySchema>;

export async function login(
  request: FastifyRequest<{ Body: LoginBody }>,
  reply: FastifyReply
): Promise<FastifyReply> {
  const result = await loginUser(request.body.email, request.body.password);
  return sendSuccess(reply, result);
}

export async function register(
  request: FastifyRequest<{ Body: RegisterBody }>,
  reply: FastifyReply
): Promise<FastifyReply> {
  const user = await createUser(
    request.body.email,
    request.body.password,
    'owner',
    request.body.name,
    request.body.phone
  );
  
  const tokenPair = await generateTokenPair(user.id);
  
  return sendSuccess(reply, {
    accessToken: tokenPair.accessToken,
    refreshToken: tokenPair.refreshToken,
    user,
  }, 201);
}

export async function refresh(
  request: FastifyRequest<{ Body: RefreshTokenBody }>,
  reply: FastifyReply
): Promise<FastifyReply> {
  const tokenPair = await refreshAccessToken(request.body.refreshToken);
  return sendSuccess(reply, tokenPair);
}

export async function logout(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<FastifyReply> {
  const user = request.user;
  if (!user) {
    throw new UnauthorizedError('User not authenticated');
  }
  
  await revokeRefreshToken(user.id);
  return sendSuccess(reply, { success: true });
}

export async function me(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<FastifyReply> {
  const user = request.user;
  if (!user) {
    throw new UnauthorizedError('User not authenticated');
  }

  if (!ObjectId.isValid(user.id)) {
    throw new Error('Invalid user ID');
  }

  const db = getDatabase();
  const usersCollection = getUsersCollection(db);
  const dbUser = await usersCollection.findOne(
    { _id: new ObjectId(user.id) },
    { projection: { passwordHash: 0, refreshToken: 0 } }
  );
  
  if (!dbUser) {
    throw new NotFoundError('User');
  }

  return sendSuccess(reply, {
    id: dbUser._id.toString(),
    email: dbUser.email,
    role: dbUser.role,
    name: dbUser.name,
    phone: dbUser.phone,
  });
}
