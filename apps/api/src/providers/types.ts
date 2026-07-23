export type ProviderResult = {
  provider: string;
  providerReference: string;
  status: 'processing' | 'completed' | 'failed';
  failureCode?: string;
};

export interface PaymentProviderAdapter {
  readonly name: string;
  submit(paymentIntentId: string): Promise<ProviderResult>;
  verifyWebhook(rawBody: Buffer, headers: Record<string, string | string[] | undefined>): Promise<ProviderResult>;
}
