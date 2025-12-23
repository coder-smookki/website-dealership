import { FastifyRequest, FastifyReply } from 'fastify';
import { Types } from 'mongoose';
import { loginUser, createUser } from '../services/auth.service.js';
import { refreshAccessToken, revokeRefreshToken, generateTokenPair } from '../services/token.service.js';
import { loginSchema, registerSchema } from '../utils/validate.js';
import { handleError, ValidationError, UnauthorizedError, NotFoundError } from '../utils/errors.js';
import { sendSuccess } from '../utils/response.js';
import { User } from '../models/User.js';
import { AuthUser } from '../middlewares/auth.js';

interface LoginBody {
  email: string;
  password: string;
}

interface RegisterBody {
  email: string;
  password: string;
  name: string;
  phone: string;
}

interface RefreshBody {
  refreshToken: string;
}

export async function login(
  request: FastifyRequest<{ Body: LoginBody }>,
  reply: FastifyReply
): Promise<FastifyReply> {
  try {
    const validated = loginSchema.safeParse(request.body);
    if (!validated.success) {
      throw new ValidationError(validated.error.errors[0]?.message || 'Invalid input');
    }
    
    const result = await loginUser(validated.data.email, validated.data.password);
    
    return sendSuccess(reply, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    });
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function register(
  request: FastifyRequest<{ Body: RegisterBody }>,
  reply: FastifyReply
): Promise<FastifyReply> {
  try {
    const validated = registerSchema.safeParse(request.body);
    if (!validated.success) {
      throw new ValidationError(validated.error.errors[0]?.message || 'Invalid input');
    }
    
    const user = await createUser(
      validated.data.email.toLowerCase().trim(),
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
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function refresh(
  request: FastifyRequest<{ Body: RefreshBody }>,
  reply: FastifyReply
): Promise<FastifyReply> {
  try {
    const { refreshToken } = request.body;
    
    if (!refreshToken || typeof refreshToken !== 'string') {
      throw new ValidationError('Refresh token is required');
    }
    
    const tokenPair = await refreshAccessToken(refreshToken);
    
    return sendSuccess(reply, {
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
    });
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function logout(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<FastifyReply> {
  try {
    const user = request.user as AuthUser | undefined;
    if (!user) {
      throw new UnauthorizedError('User not authenticated');
    }
    
    await revokeRefreshToken(user.id);
    
    return sendSuccess(reply, { success: true });
  } catch (error) {
    return handleError(error, reply);
  }
}

export async function me(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<FastifyReply> {
  try {
    const user = request.user as AuthUser | undefined;
    if (!user) {
      throw new UnauthorizedError('User not authenticated');
    }

    if (!Types.ObjectId.isValid(user.id)) {
      throw new ValidationError('Invalid user ID');
    }

    const dbUser = await User.findById(user.id)
      .select('-passwordHash -refreshToken')
      .lean();
    
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
  } catch (error) {
    return handleError(error, reply);
  }
}
