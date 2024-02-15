import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { getJwtError } from './getErrorMessage.js';
import pool from '@/database/utils.js';
import { nanoid } from 'nanoid';
import logError from './logError.js';
import { GenerateAct, TokenPayload } from '@/types/common.js';

dotenv.config();

const secret = process.env.JWT_SECRET || 'jyrf45gq978n_97YG4Q5';

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
    logError(`verfifyToken @/common/utils: ${getJwtError(error)}`);
    return { error: getJwtError(error) };
  }
}

export function decodeToken(token: string) {
  if (!token) {
    logError('decodeToken @/common/utils: token is undefined.');
    throw new Error(
      'decodeToken @/common/utils: An error occured decoding token.',
    );
  }

  const payload = token
    .split('.')
    .filter((_part, index) => index === 1)
    .join('');

  const buff = Buffer.from(payload, 'base64url');
  const decoded = buff.toString('ascii');
  return JSON.parse(decoded);
}

export async function createSession(userId: number) {
  const refreshToken = nanoid();
  await pool.query(
    'INSERT INTO refresh_tokens (token, user_id) VALUES ($1, $2) RETURNING id',
    [refreshToken, userId],
  );

  const payload = {
    uid: userId,
    rft: refreshToken,
  };

  const token = jwt.sign(payload, secret, { expiresIn: 15 * 60 });

  return token;
}

export async function generateAct({ userId, rft }: GenerateAct) {
  const payload = { uid: userId, rft };
  const token = jwt.sign(payload, secret, { expiresIn: 15 * 60 });
  return token;
}
