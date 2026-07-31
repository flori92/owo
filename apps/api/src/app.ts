import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import Fastify from 'fastify';
import { z, ZodError } from 'zod';
import { createAuthenticator, type TokenVerifier } from './auth.js';
import type { AppConfig } from './config.js';
import type { Database } from './database.js';
import { requestAccountDeletion } from './services/account-deletion.js';
import {
  AccountAccessError,
  createPaymentIntent,
  getPaymentIntent,
  IdempotencyConflictError,
  listPaymentIntents,
} from './services/payment-intents.js';
import { listAccounts, synchronizeUser, updateUserMarket } from './services/users.js';
import './types.js';
import { analyzeFinancialProfile, answerCoachQuestion } from './domain/financial-coach.js';
import { getFinancialProfile, saveFinancialProfile } from './services/financial-profiles.js';
import { marketCatalog } from './domain/markets.js';

const paymentIntentSchema = z
  .object({
    sourceAccountId: z.string().uuid(),
    type: z.enum(['send', 'receive', 'deposit']),
    amountMinor: z.number().int().positive().max(1_000_000_000_000),
    currency: z.enum(['XAF', 'XOF']).default('XAF'),
    title: z.string().trim().min(1).max(120),
    description: z.string().trim().max(500).nullable().optional(),
    recipientName: z.string().trim().max(120).nullable().optional(),
    recipientPhone: z.string().trim().min(8).max(24).nullable().optional(),
  })
  .superRefine((value, context) => {
    if (value.type === 'send' && (!value.recipientName || !value.recipientPhone)) {
      context.addIssue({
        code: 'custom',
        path: ['recipientPhone'],
        message: 'Le destinataire est requis pour un envoi.',
      });
    }
  });

const financialProfileSchema = z.object({
  currency: z.enum(['XAF', 'XOF']).default('XAF'),
  monthlyIncomeMinor: z.number().int().nonnegative().max(1_000_000_000_000),
  currentSavingsMinor: z.number().int().nonnegative().max(1_000_000_000_000),
  debtPaymentsMinor: z.number().int().nonnegative().max(1_000_000_000_000),
  emergencyFundMonths: z.number().int().min(1).max(12).default(3),
  dayOfMonth: z.number().int().min(1).max(31),
  daysInMonth: z.number().int().min(28).max(31),
  categories: z.array(z.object({
    code: z.string().trim().min(1).max(40),
    name: z.string().trim().min(1).max(80),
    spentMinor: z.number().int().nonnegative().max(1_000_000_000_000),
    limitMinor: z.number().int().nonnegative().max(1_000_000_000_000),
    essential: z.boolean().optional(),
  })).min(1).max(30),
});

const storedFinancialProfileSchema = financialProfileSchema.omit({
  dayOfMonth: true,
  daysInMonth: true,
});

export type BuildAppOptions = {
  config: AppConfig;
  database: Database;
  verifyToken: TokenVerifier;
  logger?: boolean;
};

export async function buildApp(options: BuildAppOptions) {
  const app = Fastify({
    logger: options.logger === false ? false : { level: options.config.logLevel },
    trustProxy: options.config.trustProxy,
    bodyLimit: 64 * 1024,
    requestIdHeader: 'x-request-id',
  });
  app.decorateRequest('user', null);

  await app.register(helmet, { global: true });
  await app.register(cors, {
    origin: options.config.corsOrigins.length ? options.config.corsOrigins : false,
    credentials: false,
  });
  await app.register(rateLimit, {
    max: 120,
    timeWindow: '1 minute',
    ban: 3,
  });

  const authenticate = createAuthenticator(options.verifyToken);

  app.get('/health/live', async () => ({ status: 'ok' }));
  app.get('/v1/markets', async () => ({ markets: Object.values(marketCatalog) }));
  app.get('/health/ready', async (_request, reply) => {
    try {
      await options.database.query('SELECT 1');
      return { status: 'ready' };
    } catch {
      return reply.code(503).send({ status: 'unavailable' });
    }
  });

  app.get('/v1/me', { preHandler: authenticate }, async (request) => {
    const user = await synchronizeUser(options.database, request.user!);
    return {
      id: user.id,
      firebaseUid: user.firebase_uid,
      email: user.email,
      displayName: user.display_name,
      status: user.status,
      countryCode: user.country_code,
      region: user.region_code,
      preferredCurrency: user.preferred_currency,
    };
  });

  app.patch('/v1/me/market', { preHandler: authenticate }, async (request) => {
    await synchronizeUser(options.database, request.user!);
    const body = z.object({ countryCode: z.enum(['CM', 'BJ', 'CI', 'SN']) }).parse(request.body);
    const user = await updateUserMarket(options.database, request.user!.uid, body.countryCode);
    return {
      countryCode: user.country_code,
      region: user.region_code,
      preferredCurrency: user.preferred_currency,
    };
  });

  app.get('/v1/accounts', { preHandler: authenticate }, async (request) => {
    await synchronizeUser(options.database, request.user!);
    const accounts = await listAccounts(options.database, request.user!.uid);
    return {
      accounts: accounts.map((account) => ({
        id: account.id,
        reference: account.public_reference,
        currency: account.currency,
        status: account.status,
        balanceMinor: account.balance_minor,
        availableBalanceMinor: account.available_balance_minor,
      })),
    };
  });

  app.post('/v1/financial-coach/analyze', { preHandler: authenticate }, async (request) => {
    await synchronizeUser(options.database, request.user!);
    const profile = financialProfileSchema.parse(request.body);
    return analyzeFinancialProfile(profile);
  });

  app.get('/v1/financial-coach/profile', { preHandler: authenticate }, async (request) => {
    await synchronizeUser(options.database, request.user!);
    return { profile: await getFinancialProfile(options.database, request.user!.uid) };
  });

  app.put('/v1/financial-coach/profile', { preHandler: authenticate }, async (request) => {
    await synchronizeUser(options.database, request.user!);
    const profile = storedFinancialProfileSchema.parse(request.body);
    return {
      profile: await saveFinancialProfile(options.database, request.user!.uid, profile),
    };
  });

  app.post('/v1/financial-coach/chat', { preHandler: authenticate }, async (request) => {
    await synchronizeUser(options.database, request.user!);
    const body = z.object({
      question: z.string().trim().min(2).max(500),
      profile: financialProfileSchema,
    }).parse(request.body);
    const analysis = analyzeFinancialProfile(body.profile);
    return {
      answer: answerCoachQuestion(body.question, analysis),
      analysis,
      disclaimer: "Les réponses owo! sont éducatives et ne constituent pas un conseil en investissement personnalisé.",
    };
  });

  app.get('/v1/payment-intents', { preHandler: authenticate }, async (request) => {
    const query = z.object({ limit: z.coerce.number().int().min(1).max(100).default(20) }).parse(request.query);
    const intents = await listPaymentIntents(options.database, request.user!.uid, query.limit);
    return {
      items: intents.map((intent) => ({
        id: intent.id,
        reference: intent.reference,
        status: intent.status,
        type: intent.type,
        amountMinor: intent.amount_minor,
        currency: intent.currency,
        title: intent.title,
        description: intent.description,
        recipientName: intent.recipient_name,
        settlementPath: intent.settlement_path,
        failureCode: intent.failure_code,
        createdAt: intent.created_at,
        updatedAt: intent.updated_at,
      })),
    };
  });

  app.get('/v1/payment-intents/:id', { preHandler: authenticate }, async (request, reply) => {
    const params = z.object({ id: z.string().uuid() }).parse(request.params);
    const intent = await getPaymentIntent(options.database, request.user!.uid, params.id);
    if (!intent) return reply.code(404).send({ error: 'payment_intent_not_found' });
    reply.header('Cache-Control', 'no-store');
    return {
      id: intent.id,
      reference: intent.reference,
      status: intent.status,
      type: intent.type,
      amountMinor: intent.amount_minor,
      currency: intent.currency,
      title: intent.title,
      description: intent.description,
      recipientName: intent.recipient_name,
      settlementPath: intent.settlement_path,
      failureCode: intent.failure_code,
      createdAt: intent.created_at,
      updatedAt: intent.updated_at,
      completedAt: intent.completed_at,
    };
  });

  app.post('/v1/payment-intents', { preHandler: authenticate }, async (request, reply) => {
    const startedAt = performance.now();
    const idempotencyKey = z.string().min(8).max(128).parse(request.headers['idempotency-key']);
    const input = paymentIntentSchema.parse(request.body);
    const intent = await createPaymentIntent(options.database, request.user!, idempotencyKey, input);
    const statusCode = intent.status === 'processing' || intent.status === 'pending' ? 202 : 201;
    reply.header('Cache-Control', 'no-store');
    reply.header('Server-Timing', `command;dur=${(performance.now() - startedAt).toFixed(1)}`);
    return reply.code(statusCode).send({
      id: intent.id,
      reference: intent.reference,
      status: intent.status,
      type: intent.type,
      amountMinor: intent.amount_minor,
      currency: intent.currency,
      title: intent.title,
      settlementPath: intent.settlement_path,
      failureCode: intent.failure_code,
      createdAt: intent.created_at,
      updatedAt: intent.updated_at,
      completedAt: intent.completed_at,
    });
  });

  app.post('/v1/account-deletion-requests', { preHandler: authenticate }, async (request, reply) => {
    const body = z.object({ reason: z.string().trim().max(500).nullable().default(null) }).parse(request.body);
    const deletionRequest = await requestAccountDeletion(options.database, request.user!, body.reason || null);
    return reply.code(202).send({
      id: deletionRequest.id,
      status: deletionRequest.status,
      requestedAt: deletionRequest.requested_at,
    });
  });

  app.setErrorHandler((error, request, reply) => {
    request.log.error({ err: error }, 'request_failed');
    if (error instanceof ZodError) {
      return reply.code(400).send({ error: 'validation_error', details: error.issues });
    }
    if (error instanceof IdempotencyConflictError) {
      return reply.code(409).send({ error: 'idempotency_conflict' });
    }
    if (error instanceof AccountAccessError) {
      return reply.code(403).send({ error: 'account_access_denied' });
    }
    return reply.code(500).send({ error: 'internal_error', requestId: request.id });
  });

  return app;
}
