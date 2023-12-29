import { handleAccess } from '@/common/middleWares.js';
import { Router } from 'express';
import rateLimiter from '../ai/utils/rateLimiter.js';
import {
  decrementRemainingUsage,
  resetRateLimit,
} from '@/database/rateLimits.js';
import { validateUserContent } from '../ai/utils/validateUserContent.js';

const protectedRoute = Router();

protectedRoute.use(handleAccess);
protectedRoute.use(rateLimiter);
protectedRoute.use(validateUserContent);

protectedRoute.post('/', async (req, res) => {
  try {
    const { user, timestamp } = req.body;

    if (timestamp) {
      resetRateLimit(user.uid, timestamp);
    }

    await decrementRemainingUsage(user.uid);

    return res
      .status(200)
      .json({ message: 'Protected route is unlocked.', user });
  } catch (error) {
    return res.status(500).json({ error });
  }
});

export default protectedRoute;
