import { FastifyInstance } from 'fastify';
import jwt from '@fastify/jwt';
import { env } from '../config/env.js';

export async function jwtPlugin(fastify: FastifyInstance) {
  try {
    await fastify.register(jwt, {
      secret: env.jwtSecret,
      sign: {
        expiresIn: env.jwtExpiresIn,
      },
    });
    
    // Проверяем, что JWT зарегистрирован
    if (!fastify.jwt) {
      console.error('JWT plugin registration failed - jwt not available');
      throw new Error('JWT plugin registration failed');
    }
    
    console.log('JWT plugin registered in plugin function');
  } catch (error) {
    console.error('Error registering JWT plugin:', error);
    throw error;
  }
}

