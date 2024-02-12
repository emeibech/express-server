import logError from '@/common/logError.js';
import { getTimestamp, isLimitReached } from '@/database/rateLimits.js';
import { transaction } from '@/database/utils.js';
import type { CustomRequest } from '@/types/common.js';
import type { NextFunction, Response } from 'express';

const superUsers: number[] = JSON.parse(process.env.SUPERUSERS || '[]');

// default duration for rate limiter in seconds
const defaultDuration = 86400;

export default async function rateLimiter(
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const uid = req.user?.uid;

    if (!uid) {
      logError('rateLimiter at @/routes/ai/utils: uid is undefined');
      throw new Error('rateLimiter at @/routes/ai/utils: uid is undefined');
    }

    await insertRateLimit(uid);

    // for accounts you want to exempt from rate limiter, like your own account
    if (superUsers.includes(uid)) {
      return next();
    }

    const timeNow = Date.now() / 1000;
    const timestamp = await getTimestamp(uid);

    if (timeNow - timestamp >= defaultDuration) {
      req.timestamp = timestamp;
      return next();
    }

    if (await isLimitReached(uid)) {
      return res.status(429).json({ message: 'Rate limit reached.' });
    }

    return next();
  } catch (error) {
    logError(`rateLimiter at @/routes/ai/utils: ${error}`);
    res.status(500).json({ message: 'An error occured' });
  }
}

export async function insertRateLimit(id: number) {
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
  } catch (error) {
    logError(`insertRateLimit at @/routes/ai/utils: ${error}`);
  }
}
