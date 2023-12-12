import { getTimestamp, isLimitReached } from '@/database/rateLimits.js';
import { transaction } from '@/database/utils.js';
import type { NextFunction, Request, Response } from 'express';

const defaultDuration = 30;

export default async function rateLimiter(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { uid } = req.body.user;
    await insertRateLimit(uid);

    const timeNow = Date.now() / 1000;
    const timestamp = await getTimestamp(uid);

    if (timeNow - timestamp >= defaultDuration) {
      req.body.timestamp = timestamp;
      return next();
    }

    if (await isLimitReached(uid)) {
      return res.status(429).json({ message: 'Rate limit reached.' });
    }

    return next();
  } catch (error) {
    console.log('Rate limiter error: ', error);
    res.status(500).json({ message: 'An error occured' });
  }
}

export async function insertRateLimit(id: string) {
  try {
    await transaction([
      {
        text: `
        INSERT INTO rate_limits (user_id)
        SELECT $1
        WHERE NOT EXISTS (
          SELECT 1
          FROM rate_limits
          WHERE user_id = $1
        )
      `,
        values: [id],
      },
    ]);

    console.log('Rate limit added');
  } catch (error) {
    console.log('An error occured while inserting rate limit', error);
    throw error;
  }
}
