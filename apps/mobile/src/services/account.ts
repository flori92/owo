import { IS_DEMO_MODE } from '@/config/appConfig';
import { apiRequest, isApiConfigured } from '@/services/api/client';

export async function submitAccountDeletion(reason = '') {
  if (IS_DEMO_MODE) return { success: true, status: 'demo' };
  if (!isApiConfigured()) {
    return { success: false, error: "L'API owo! n'est pas configurée." };
  }
  try {
    const result = await apiRequest<{ id: string; status: string; requestedAt: string }>(
      '/v1/account-deletion-requests',
      { method: 'POST', body: JSON.stringify({ reason: reason.trim() || null }) },
    );
    return { success: true, ...result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Demande impossible.' };
  }
}
