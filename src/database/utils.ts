import pkg from 'pg';
import dotenv from 'dotenv';
import type { QueryParams } from '@/types/database.js';

dotenv.config();

const { Pool } = pkg;
const pool = new Pool();

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
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
    console.log(`Error: ${error}`);
    throw error;
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
    console.log('Transaction successful');
  } catch (error) {
    await client.query('ROLLBACK');
    console.log(`Error: ${error}`);
    throw error;
  } finally {
    client.release();
  }
}
