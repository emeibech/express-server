import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { getJwtError } from './getErrorMessage.js';
import { TokenPayload } from '@/types/common.js';
import pool from '@/database/utils.js';
import { nanoid } from 'nanoid';
import logError from './logError.js';

dotenv.config();

export async function hashPassword(password: string) {
  try {
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
  } catch (error) {
    logError(`hashPassword at @/common/utils.ts: ${error}`);
  }
}

export async function comparePasswords(
  plainPassword: string,
  hashedPassword: string,
) {
  try {
    const result = await bcrypt.compare(plainPassword, hashedPassword);
    return result;
  } catch (error) {
    logError(`comparePasswords at @/common/utils.ts: ${error}`);
  }
}

export async function verifyToken(token: string) {
  try {
    const secret = process.env.JWT_SECRET || 'jyrf45gq978n_97YG4Q5';
    const decoded = jwt.verify(token, secret);

    return { payload: decoded as TokenPayload };
  } catch (error) {
    const jwtError = getJwtError(error);
    if (jwtError.includes('jwt expired')) return { expired: true };
    return { error: getJwtError(error) };
  }
}

export function decodeToken(token: string) {
  const payload = token
    .split('.')
    .filter((_part, index) => index === 1)
    .join('');

  const buff = Buffer.from(payload, 'base64url');
  const decoded = buff.toString('ascii');
  return JSON.parse(decoded);
}

export async function createSession(userId: number) {
  const secret = process.env.JWT_SECRET || 'jyrf45gq978n_97YG4Q5';
  const sessionToken = nanoid();
  const session = await pool.query(
    'INSERT INTO sessions (token, user_id) VALUES ($1, $2) RETURNING id',
    [sessionToken, userId],
  );

  const payload = {
    uid: userId,
    sid: session.rows[0].id,
  };

  const token = jwt.sign(payload, secret, { expiresIn: '15 days' });

  return token;
}
