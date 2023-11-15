import pkg from 'pg';
import dotenv from 'dotenv';
import type { QueryParams } from '@/types/common.js';

dotenv.config();

const { Pool } = pkg;
const pool = new Pool();

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export function query(queryParams: QueryParams) {
  try {
    pool.query(queryParams);
  } catch (error) {
    console.log({ error: 'Error executing query' });
    throw error;
  }
}

export async function insertUnregistered(ip: string) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const params = {
      text: `
            INSERT INTO unregistered(ip)
            SELECT $1
            WHERE NOT EXISTS (
              SELECT 1
              FROM unregistered
              WHERE ip = $1
            )
          `,
      values: [ip],
    };

    await client.query(params);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
