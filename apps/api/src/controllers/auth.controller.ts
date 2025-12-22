import { FastifyRequest, FastifyReply } from 'fastify';
import { loginUser, createUser } from '../services/auth.service.js';
import { loginSchema, registerSchema } from '../utils/validate.js';
import { handleError } from '../utils/errors.js';
import { User } from '../models/User.js';

export async function login(
  request: FastifyRequest<{ Body: { email: string; password: string } }>,
  reply: FastifyReply
) {
  try {
    const data = loginSchema.parse(request.body);
    const user = await loginUser(data.email, data.password);
    
    // Используем request.server - это корневой fastify instance с зарегистрированными плагинами
    const fastify = request.server as any;
    
    // Проверяем доступность JWT
    if (!fastify) {
      console.error('Fastify server instance not found');
      throw new Error('Server configuration error');
    }
    
    // В @fastify/jwt версии 7.x, jwt доступен через fastify.jwt
    if (!fastify.jwt) {
      console.error('JWT plugin not found in server instance');
      console.error('Server keys:', Object.keys(fastify).slice(0, 20));
      throw new Error('JWT plugin not registered');
    }
    
    // Используем fastify.jwt.sign() - правильный способ для @fastify/jwt 7.x
    const token = fastify.jwt.sign({
      id: user.id,
      role: user.role,
      email: user.email,
    });

    return reply.send({
      token,
      user,
    });
  } catch (error) {
    console.error('Login error:', error);
    return handleError(error, reply);
  }
}

export async function register(
  request: FastifyRequest<{ Body: { email: string; password: string; name: string; phone: string } }>,
  reply: FastifyReply
) {
  try {
    const data = registerSchema.parse(request.body);
    
    // Создаем пользователя с ролью owner
    const user = await createUser(
      data.email.toLowerCase().trim(),
      data.password,
      'owner',
      data.name,
      data.phone
    );
    
    // Используем request.server для доступа к JWT
    const fastify = request.server as any;
    
    if (!fastify || !fastify.jwt) {
      console.error('JWT plugin not available');
      throw new Error('Server configuration error');
    }
    
    // Создаем JWT токен
    const token = fastify.jwt.sign({
      id: user.id,
      role: user.role,
      email: user.email,
    });

    return reply.code(201).send({
      token,
      user,
    });
  } catch (error) {
    console.error('Register error:', error);
    return handleError(error, reply);
  }
}

export async function me(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const user = request.user;
    if (!user) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    const dbUser = await User.findById(user.id).select('-passwordHash').lean();
    if (!dbUser) {
      return reply.code(404).send({ error: 'User not found' });
    }

    return reply.send({
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

