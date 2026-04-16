import { Pool } from 'pg';

const globalForPg = globalThis as unknown as { pgPool: Pool };

export const pool: Pool =
  globalForPg.pgPool ??
  new Pool({
    host:     process.env.DB_HOST     || '16.171.198.166',
    port:     parseInt(process.env.DB_PORT || '5432'),
    user:     process.env.DB_USER     || 'pakload',
    password: process.env.DB_PASSWORD || 'Khan123@#',
    database: process.env.DB_NAME     || 'elections',
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 8000,
  });

if (process.env.NODE_ENV !== 'production') globalForPg.pgPool = pool;

export async function query<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const result = await pool.query(sql, params);
  return result.rows as T[];
}

export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

export default pool;
