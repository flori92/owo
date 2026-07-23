import { createFirebaseTokenVerifier } from './auth.js';
import { buildApp } from './app.js';
import { loadConfig } from './config.js';
import { createDatabase } from './database.js';

const config = loadConfig();
const database = createDatabase(config.databaseUrl, config.databaseSsl);
const app = await buildApp({
  config,
  database,
  verifyToken: createFirebaseTokenVerifier(config.firebaseProjectId),
});

const shutdown = async (signal: string) => {
  app.log.info({ signal }, 'shutdown_started');
  await app.close();
  await database.close();
  process.exit(0);
};

process.once('SIGTERM', () => void shutdown('SIGTERM'));
process.once('SIGINT', () => void shutdown('SIGINT'));

try {
  await app.listen({ host: config.host, port: config.port });
} catch (error) {
  app.log.error(error);
  await database.close();
  process.exit(1);
}
