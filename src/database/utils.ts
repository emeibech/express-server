import pkg from 'pg';
import dotenv from 'dotenv';
import type { QueryParams } from '@/types/database.js';
import logError from '@/common/logError.js';

dotenv.config();

const { Pool } = pkg;
const pool = new Pool();

pool.on('error', (err) => {
  logError(`Pool unexpected error: ${err}`);
  process.exit(-1);
});

export default pool;

export async function getValue({ text, values }: QueryParams) {
  try {
    const { rows } = await pool.query({
      text,
      values,
    });
    return rows;
  } catch (error) {
    logError(`getValue at @/database/utils.ts: ${error}`);
    return [];
  }
}

export async function transaction(queries: QueryParams[]) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    for (const query of queries) {
      await client.query(query);
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    logError(`transaction at @/database/utils.ts: ${error}`);
  } finally {
    client.release();
  }
}
