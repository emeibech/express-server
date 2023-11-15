import { Request, Response, Router } from 'express';
import { insertUnregistered } from '@/common/db.js';
import { handleCors } from '@/common/middleWares.js';

const checkId = Router();

checkId.use(handleCors);

checkId.get('/', async (req: Request, res: Response) => {
  try {
    await insertUnregistered(req.header('X-Real-IP') || req.ip);
    res.json({ ip: req.ip });
  } catch (error) {
    res.status(res.statusCode).json({ error });
  }
});

export default checkId;
