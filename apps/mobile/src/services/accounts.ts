import { apiRequest } from '@/services/api/client';

type ApiAccount = {
  id: string;
  reference: string;
  currency: string;
  status: string;
  balanceMinor: string;
  availableBalanceMinor: string;
};

const currencyExponent: Record<string, number> = { XAF: 0, XOF: 0, EUR: 2, USD: 2 };

function fromMinorUnits(amountMinor: string, currency: string): number {
  return Number(amountMinor) / 10 ** (currencyExponent[currency] ?? 2);
}

export async function getApiWallets() {
  try {
    const { accounts } = await apiRequest<{ accounts: ApiAccount[] }>('/v1/accounts');
    return {
      success: true,
      wallets: accounts.map((account, index) => ({
        id: account.id,
        $id: account.id,
        name: index === 0 ? 'Portefeuille principal' : `Portefeuille ${account.currency}`,
        type: 'main',
        provider: 'owo!',
        accountNumber: account.reference,
        currency: account.currency,
        balance: fromMinorUnits(account.availableBalanceMinor, account.currency),
        ledgerBalance: fromMinorUnits(account.balanceMinor, account.currency),
        availableBalance: fromMinorUnits(account.availableBalanceMinor, account.currency),
        status: account.status,
        isPrimary: index === 0,
      })),
    };
  } catch (error) {
    return {
      success: false,
      wallets: [],
      error: error instanceof Error ? error.message : 'Portefeuilles indisponibles.',
    };
  }
}
