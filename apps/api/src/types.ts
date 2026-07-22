export type AuthenticatedUser = {
  uid: string;
  email?: string;
  name?: string;
  phone?: string;
};

declare module 'fastify' {
  interface FastifyRequest {
    user: AuthenticatedUser | null;
  }
}
