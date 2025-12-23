import { FastifyInstance } from 'fastify';
import { connectDatabase } from '../db/client.js';

export async function dbPlugin(fastify: FastifyInstance) {
  await connectDatabase();
  fastify.log.info('MongoDB connected');
}