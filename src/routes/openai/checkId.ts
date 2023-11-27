import { Request, Response, Router } from 'express';
import { getIdFromIp, getValue } from '@/common/database/utils.js';
import { handleCors } from '@/common/middleWares.js';
import {
  calculateRateLimit,
  decrementRemainingUsage,
  getTimestamp,
  insertUnregistered,
  isLimitReached,
} from '@/common/database/unregistered.js';

const checkId = Router();

checkId.use(handleCors);

checkId.post('/', async (req: Request, res: Response) => {
  try {
    await insertUnregistered(req.header('X-Real-IP') || req.ip);
    const id = await getIdFromIp({
      table: 'unregistered',
      value: req.header('X-Real-IP') || req.ip,
    });

    await calculateRateLimit(id);

    if (await isLimitReached(id)) {
      console.log('Rate limit has been reached.');
    } else {
      await decrementRemainingUsage(id);
    }

    const timestamp = await getTimestamp(id);

    const remainingUsage = await getValue(
      'SELECT remaining_usage FROM unregistered WHERE id = $1;',
      [id],
    );

    console.log({ id, timestamp, remainingUsage });
    res.sendStatus(200);
  } catch (error) {
    res.status(res.statusCode).json({ error });
  }
});

export default checkId;
