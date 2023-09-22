import { Router } from 'express';
import apicache from 'apicache';
import { handleCors, handleRateLimit } from '../../common/middleWares.js';
import chatCompletion from './utils/chatCompletion.js';
import { getOpenAiError } from '@/common/getErrorMessage.js';

const generalAssistant = Router();
const { middleware } = apicache;
const cache = middleware;

generalAssistant.use(handleCors);
generalAssistant.use(handleRateLimit({ max: 10, minutes: 1440 }));
generalAssistant.use(cache('5 minutes'));

generalAssistant.get('/', async (req, res) => {
  try {
    await chatCompletion({
      res,
      sysContent: 'You are a helpful assistant.',
      userContent: String(req.query.prompt),
      temperature: 0.5,
    });

    res.end();
  } catch (error) {
    res.status(500).json({
      error: getOpenAiError(error),
    });
  }
});

export default generalAssistant;
