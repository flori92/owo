import pg, { type PoolClient, type QueryResult, type QueryResultRow } from 'pg';

export type Queryable = {
  query<T extends QueryResultRow = QueryResultRow>(text: string, values?: readonly unknown[]): Promise<QueryResult<T>>;
};

export type TransactionCallback<T> = (client: Queryable) => Promise<T>;

export interface Database extends Queryable {
  transaction<T>(callback: TransactionCallback<T>): Promise<T>;
  close(): Promise<void>;
}

export function createDatabase(connectionString: string, useSsl: boolean): Database {
  const pool = new pg.Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    ssl: useSsl ? { rejectUnauthorized: true } : undefined,
  });

  return {
    query: (text, values) => pool.query(text, values as unknown[] | undefined),
    async transaction<T>(callback: TransactionCallback<T>): Promise<T> {
      const client: PoolClient = await pool.connect();
      try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    },
    close: () => pool.end(),
  };
}
