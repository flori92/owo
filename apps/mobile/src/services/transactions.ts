import * as Crypto from 'expo-crypto';
import { IS_DEMO_MODE } from '@/config/appConfig';
import { apiRequest, isApiConfigured } from '@/services/api/client';
import { notifyFinancialDataChanged } from '@/services/financialEvents';

type ApiAccount = {
  id: string;
  reference: string;
  currency: string;
  status: string;
  balanceMinor: string;
};

type TransactionInput = {
  userId: string;
  walletId: string;
  walletReference?: string;
  type: 'send' | 'receive' | 'deposit';
  amount: number;
  currency?: string;
  title: string;
  description?: string | null;
  recipientName?: string | null;
  recipientPhone?: string | null;
};

type PaymentIntent = {
  id: string;
  reference: string;
  status: string;
  type: TransactionInput['type'];
  amountMinor: string;
  currency: string;
  title: string;
  description?: string | null;
  recipientName?: string | null;
  settlementPath?: 'internal' | 'external' | null;
  failureCode?: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
};

const currencyExponent: Record<string, number> = { XAF: 0, XOF: 0, EUR: 2, USD: 2 };

function toMinorUnits(amount: number, currency: string): number {
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Montant invalide.');
  const factor = 10 ** (currencyExponent[currency] ?? 2);
  return Math.round(amount * factor);
}

function fromMinorUnits(amountMinor: string, currency: string): number {
  return Number(amountMinor) / 10 ** (currencyExponent[currency] ?? 2);
}

const failureMessages: Record<string, string> = {
  insufficient_funds: 'Solde disponible insuffisant.',
  self_transfer_not_allowed: 'Vous ne pouvez pas vous envoyer de l’argent à vous-même.',
};

export async function listApiTransactions(limit = 20) {
  try {
    const { items } = await apiRequest<{ items: PaymentIntent[] }>(`/v1/payment-intents?limit=${limit}`);
    return {
      success: true,
      transactions: items.map((intent) => ({
        id: intent.id,
        $id: intent.id,
        reference: intent.reference,
        status: intent.status,
        type: intent.type,
        amount: fromMinorUnits(intent.amountMinor, intent.currency),
        currency: intent.currency,
        title: intent.title,
        description: intent.description || intent.title,
        recipientName: intent.recipientName,
        settlementPath: intent.settlementPath,
        failureCode: intent.failureCode,
        createdAt: intent.createdAt,
        updatedAt: intent.updatedAt,
      })),
    };
  } catch (error) {
    return {
      success: false,
      transactions: [],
      error: error instanceof Error ? error.message : 'Historique indisponible.',
    };
  }
}

export async function submitTransaction(input: TransactionInput) {
  if (IS_DEMO_MODE) {
    const id = Crypto.randomUUID();
    return {
      success: true,
      id,
      $id: id,
      transaction: { ...input, id, $id: id, reference: `DEMO-${id.slice(0, 8)}`, status: 'demo' },
    };
  }
  if (!isApiConfigured()) {
    return { success: false, error: "L'API transactionnelle est obligatoire en production." };
  }

  try {
    const { accounts } = await apiRequest<{ accounts: ApiAccount[] }>('/v1/accounts');
    const currency = (input.currency || 'XAF').toUpperCase();
    const source =
      accounts.find((account) => account.id === input.walletId) ??
      accounts.find((account) => account.reference === input.walletReference) ??
      accounts.find((account) => account.currency === currency && account.status === 'active');
    if (!source) {
      return { success: false, error: 'Aucun compte source actif ne correspond à ce portefeuille.' };
    }

    const intent = await apiRequest<PaymentIntent>('/v1/payment-intents', {
      method: 'POST',
      idempotencyKey: Crypto.randomUUID(),
      body: JSON.stringify({
        sourceAccountId: source.id,
        type: input.type,
        amountMinor: toMinorUnits(input.amount, currency),
        currency,
        title: input.title,
        description: input.description || null,
        recipientName: input.recipientName || null,
        recipientPhone: input.recipientPhone || null,
      }),
    });
    notifyFinancialDataChanged();

    if (intent.status === 'failed') {
      return {
        success: false,
        error: failureMessages[intent.failureCode || ''] || 'La transaction a été refusée.',
        transaction: intent,
      };
    }

    return {
      success: true,
      id: intent.id,
      $id: intent.id,
      transaction: {
        id: intent.id,
        $id: intent.id,
        reference: intent.reference,
        status: intent.status,
        type: intent.type,
        amount: input.amount,
        currency: intent.currency,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Impossible de créer la demande.';
    return { success: false, error: message };
  }
}
