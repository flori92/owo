import { getApps, initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { AuthenticatedUser } from './types.js';

export type TokenVerifier = (token: string) => Promise<AuthenticatedUser>;

export function createFirebaseTokenVerifier(projectId: string): TokenVerifier {
  const app =
    getApps()[0] ??
    initializeApp({
      credential: applicationDefault(),
      projectId,
    });

  return async (token: string) => {
    const decoded = await getAuth(app).verifyIdToken(token, true);
    return {
      uid: decoded.uid,
      email: decoded.email,
      name: typeof decoded.name === 'string' ? decoded.name : undefined,
      phone: typeof decoded.phone_number === 'string' ? decoded.phone_number : undefined,
    };
  };
}

export function createAuthenticator(verifyToken: TokenVerifier) {
  return async function authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const authorization = request.headers.authorization;
    if (!authorization?.startsWith('Bearer ')) {
      await reply.code(401).send({ error: 'authentication_required' });
      return;
    }

    try {
      request.user = await verifyToken(authorization.slice('Bearer '.length));
    } catch {
      await reply.code(401).send({ error: 'invalid_or_expired_token' });
    }
  };
}
