import { Router } from 'express';
import { handleCors, handleRateLimit } from '../../common/middleWares.js';
import chatCompletion from './utils/chatCompletion.js';
import { getOpenAiError } from '@/common/getErrorMessage.js';

const generalAssistant = Router();

generalAssistant.use(handleCors);
generalAssistant.use(handleRateLimit({ max: 100, minutes: 1440 }));

generalAssistant.post('/', async (req, res) => {
  try {
    await chatCompletion({
      res,
      sysContent:
        'You are a helpful assistant. Respond in a casual and friendly tone. Prefer vocabulary that people actually uses in a real conversation.',
      userContent: req.body,
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
