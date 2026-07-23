import { getAuthInstance } from '@/lib/firebase';

const baseUrl = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/$/, '') ?? '';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
  }
}

export function isApiConfigured(): boolean {
  return /^https?:\/\//.test(baseUrl);
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { idempotencyKey?: string } = {},
): Promise<T> {
  if (!isApiConfigured()) {
    throw new ApiError("L'API owo! n'est pas configurée.", 0, 'api_not_configured');
  }
  const firebaseUser = getAuthInstance()?.currentUser;
  if (!firebaseUser) {
    throw new ApiError('Votre session a expiré.', 401, 'authentication_required');
  }

  const token = await firebaseUser.getIdToken();
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');
  headers.set('Authorization', `Bearer ${token}`);
  if (options.body) headers.set('Content-Type', 'application/json');
  if (options.idempotencyKey) headers.set('Idempotency-Key', options.idempotencyKey);

  const response = await fetch(`${baseUrl}${path}`, { ...options, headers });
  const payload = (await response.json().catch(() => ({}))) as { error?: string } & T;
  if (!response.ok) {
    throw new ApiError(
      payload.error || `La requête a échoué (${response.status}).`,
      response.status,
      payload.error,
    );
  }
  return payload;
}
