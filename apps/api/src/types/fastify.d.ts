import '@fastify/jwt';

export interface AuthUser {
  id: string;
  role: 'admin' | 'owner';
  email: string;
  name?: string;
  phone?: string;
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: AuthUser;
    user: AuthUser;
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    jwt: {
      sign: (payload: any, options?: any) => string;
      verify: (token: string) => any;
    };
  }
  
  interface FastifyRequest {
    jwtVerify: () => Promise<void>;
    user: AuthUser;
  }
}