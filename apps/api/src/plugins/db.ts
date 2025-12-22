import { FastifyInstance } from 'fastify';
import mongoose from 'mongoose';
import { env } from '../config/env.js';

export async function dbPlugin(fastify: FastifyInstance) {
  try {
    await mongoose.connect(env.mongodbUri);
    fastify.log.info('Connected to MongoDB');
  } catch (error) {
    fastify.log.error(error, 'MongoDB connection error');
    throw error;
  }

  fastify.addHook('onClose', async () => {
    await mongoose.disconnect();
    fastify.log.info('Disconnected from MongoDB');
  });
}

