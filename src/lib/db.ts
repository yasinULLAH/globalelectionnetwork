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
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 2000,
  });

if (process.env.NODE_ENV !== 'production') globalForPg.pgPool = pool;

export async function query<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  try {
    const result = await pool.query(sql, params);
    return result.rows as T[];
  } catch (err) {
    console.error('DB Query Error:', (err as Error).message);
    return [] as T[];
  }
}

export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T | null> {
  try {
    const rows = await query<T>(sql, params);
    return rows[0] ?? null;
  } catch (err) {
    return null;
  }
}

export default pool;
