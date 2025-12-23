import { FastifyRequest, FastifyReply } from 'fastify';
import { ObjectId } from 'mongodb';
import { loginUser, createUser } from '../services/auth.service.js';
import { refreshAccessToken, revokeRefreshToken, generateTokenPair } from '../services/token.service.js';
import { loginSchema, registerSchema } from '../utils/validate.js';
import { ValidationError, UnauthorizedError, NotFoundError } from '../utils/errors.js';
import { sendSuccess } from '../utils/response.js';
import { getDatabase } from '../db/client.js';
import { getUsersCollection } from '../db/collections.js';
import { AuthUser } from '../middlewares/auth.js';

export async function login(
  request: FastifyRequest<{ Body: { email: string; password: string } }>,
  reply: FastifyReply
): Promise<FastifyReply> {
  const validated = loginSchema.safeParse(request.body);
  if (!validated.success) {
    throw new ValidationError(validated.error.errors[0]?.message || 'Invalid input');
  }
  
  const result = await loginUser(validated.data.email, validated.data.password);
  return sendSuccess(reply, result);
}

export async function register(
  request: FastifyRequest<{ Body: { email: string; password: string; name: string; phone: string } }>,
  reply: FastifyReply
): Promise<FastifyReply> {
  const validated = registerSchema.safeParse(request.body);
  if (!validated.success) {
    throw new ValidationError(validated.error.errors[0]?.message || 'Invalid input');
  }
  
  const user = await createUser(
    validated.data.email,
    validated.data.password,
    'owner',
    validated.data.name,
    validated.data.phone
  );
  
  const tokenPair = await generateTokenPair({
    id: user.id,
    role: user.role,
    email: user.email,
  });
  
  return sendSuccess(reply, {
    accessToken: tokenPair.accessToken,
    refreshToken: tokenPair.refreshToken,
    user,
  }, 201);
}

export async function refresh(
  request: FastifyRequest<{ Body: { refreshToken: string } }>,
  reply: FastifyReply
): Promise<FastifyReply> {
  const { refreshToken } = request.body;
  
  if (!refreshToken || typeof refreshToken !== 'string') {
    throw new ValidationError('Refresh token is required');
  }
  
  const tokenPair = await refreshAccessToken(refreshToken);
  return sendSuccess(reply, tokenPair);
}

export async function logout(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<FastifyReply> {
  const user = request.user as AuthUser | undefined;
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
  const user = request.user as AuthUser | undefined;
  if (!user) {
    throw new UnauthorizedError('User not authenticated');
  }

  if (!ObjectId.isValid(user.id)) {
    throw new ValidationError('Invalid user ID');
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
