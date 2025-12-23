import { FastifyInstance } from 'fastify';
import { connectDatabase } from '../db/client.js';

export async function dbPlugin(fastify: FastifyInstance) {
  try {
    await connectDatabase();
    fastify.log.info('Connected to MongoDB');
  } catch (error) {
    fastify.log.error(error, 'MongoDB connection error');
    throw error;
  }
  
  fastify.addHook('onClose', async () => {
    const { closeDatabase } = await import('../db/client.js');
    await closeDatabase();
    fastify.log.info('Disconnected from MongoDB');
  });
}

