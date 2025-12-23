import { FastifyInstance } from 'fastify';
import { connectDatabase } from '../db/client.js';

export async function dbPlugin(fastify: FastifyInstance) {
  try {
    await connectDatabase();
    if (fastify.logger && typeof fastify.logger.info === 'function') {
      fastify.logger.info('MongoDB подключена');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (fastify.logger && typeof fastify.logger.error === 'function') {
      fastify.logger.error({ msg: 'Ошибка подключения к MongoDB', error: errorMessage });
    }
    throw error;
  }
}