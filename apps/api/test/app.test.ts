import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import type { AppConfig } from '../src/config.js';
import type { Database } from '../src/database.js';

const config: AppConfig = {
  nodeEnv: 'test',
  port: 8080,
  host: '127.0.0.1',
  databaseUrl: 'postgresql://unused',
  databaseSsl: false,
  firebaseProjectId: 'test-project',
  corsOrigins: [],
  logLevel: 'silent',
  trustProxy: false,
};

const database: Database = {
  query: async () => ({ command: 'SELECT', rowCount: 1, oid: 0, fields: [], rows: [] }),
  transaction: async (callback) => callback(database),
  close: async () => undefined,
};

describe('API', () => {
  it('expose une sonde de vie sans authentification', async () => {
    const app = await buildApp({
      config,
      database,
      verifyToken: async () => ({ uid: 'test-user' }),
      logger: false,
    });
    const response = await app.inject({ method: 'GET', url: '/health/live' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
    await app.close();
  }, 15_000);

  it('protège les routes métier', async () => {
    const app = await buildApp({
      config,
      database,
      verifyToken: async () => ({ uid: 'test-user' }),
      logger: false,
    });
    const response = await app.inject({ method: 'GET', url: '/v1/me' });
    expect(response.statusCode).toBe(401);
    await app.close();
  });
});
