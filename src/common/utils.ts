import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { getJwtError } from './getErrorMessage.js';

dotenv.config();

export async function hashPassword(password: string) {
  try {
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw error;
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
    console.error('Error comparing passwords:', error);
    throw error;
  }
}

export async function verifyToken(token: string) {
  try {
    const secret = process.env.JWT_SECRET || 'jyrf45gq978n_97YG4Q5';
    const decoded = jwt.verify(token, secret);

    return {
      payload: decoded as JwtPayload,
    };
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
