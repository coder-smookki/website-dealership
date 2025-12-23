import 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      role: 'admin' | 'owner';
      email: string;
    };
    requestId?: string;
    startTime?: number;
  }
}
