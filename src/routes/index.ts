import ai from './ai/ai.js';
import { Router } from 'express';
import weather from './weather/weather.js';
import users from './users/users.js';
import auth from './auth/auth.js';
import logVisit from '@/common/logVisit.js';
import { handleCors } from '@/common/middleWares.js';

const index = Router();
const partialIp = process.env.PARTIAL_IP ?? '';
index.use(handleCors);

index.get('/', (req, res, next) => {
  try {
    const ip = req.header('X-Real-IP') ?? req.ip;

    res.json({
      serverStatus: 'Active',
      ip,
    });

    if (ip?.toString().includes(partialIp)) return;
    logVisit(req.headers.origin);
  } catch (error) {
    next(error);
  }
});

index.use('/ai', ai);
index.use('/weather', weather);
index.use('/users', users);
index.use('/auth', auth);

export default index;
