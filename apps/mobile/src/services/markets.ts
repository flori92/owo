import { apiRequest, isApiConfigured } from '@/services/api/client';

export async function synchronizeMarket(countryCode: string) {
  if (!isApiConfigured()) return { synchronized: false, reason: 'api_not_configured' };
  const result = await apiRequest<{ countryCode: string; region: string; preferredCurrency: string }>(
    '/v1/me/market',
    { method: 'PATCH', body: JSON.stringify({ countryCode }) },
  );
  return { synchronized: true, ...result };
}

