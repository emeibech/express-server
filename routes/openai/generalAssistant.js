import { Router } from 'express';
import apicache from 'apicache';
import { handleCors, handleRateLimit } from '../../utils/middleWares.js';
import chatCompletion from './utils/chatCompletion.js';

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
      userContent: req.query.prompt,
      temperature: 0.5,
    });

    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: '500: An error occurred while fetching openai data',
    });
  }
});

export default generalAssistant;
