import { CreateNewUser } from '@/types/database.js';
import pool from './utils.js';
import logError from '@/common/logError.js';

export async function isEmailTaken(email: string) {
  try {
    const query = 'SELECT email FROM users WHERE email = $1;';
    const values = [email];
    const { rows } = await pool.query(query, values);

    return rows.length > 0;
  } catch (error) {
    logError(`isEmailTaken at @/database/users.ts: ${error}`);
  }
}

export async function createNewUser({
  firstname,
  email,
  hashedPassword,
  dateOfBirth,
  lastname = null,
}: CreateNewUser) {
  try {
    const query = {
      text: `
        INSERT INTO users (firstname, lastname, email, password, date_of_birth)
        VALUES ($1, $2, $3, $4, $5);
      `,
      values: [firstname, lastname, email, hashedPassword, dateOfBirth],
    };

    await pool.query(query);
  } catch (error) {
    logError(`createNewUser at @/database/users.ts: ${error}`);
  }
}
