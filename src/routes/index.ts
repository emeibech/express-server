import ai from './ai/ai.js';
import { Router } from 'express';
import weather from './weather/weather.js';

const index = Router();

index.get('/', (req, res, next) => {
  try {
    res.json({
      serverStatus: 'Active',
      yourIP: req.header('X-Real-IP') ?? req.ip,
    });
  } catch (error) {
    next(error);
  }
});

index.use('/ai', ai);
index.use('/weather', weather);

export default index;
