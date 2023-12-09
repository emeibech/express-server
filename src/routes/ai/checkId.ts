import { Request, Response, Router } from 'express';
import { getValue } from '@/database/utils.js';
import {
  calculateRateLimit,
  decrementRemainingUsage,
  getTimestamp,
  insertUnregistered,
  isLimitReached,
} from '@/database/unregistered.js';

const checkId = Router();

checkId.post('/', async (req: Request, res: Response) => {
  try {
    await insertUnregistered(req.header('X-Real-IP') || req.ip);
    const id = 'id';

    await calculateRateLimit(id);

    if (await isLimitReached(id)) {
      console.log('Rate limit has been reached.');
    } else {
      await decrementRemainingUsage(id);
    }

    const timestamp = await getTimestamp(id);

    const remainingUsage = await getValue({
      text: 'SELECT remaining_usage FROM unregistered WHERE id = $1;',
      values: [id],
    });

    console.log({ id, timestamp, remainingUsage });
    res.sendStatus(200);
  } catch (error) {
    res.status(res.statusCode).json({ error });
  }
});

export default checkId;
