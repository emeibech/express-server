import { Router } from 'express';
import chatCompletion from './utils/chatCompletion.js';
import { getOpenAiError } from '@/common/getErrorMessage.js';
import { handleAccess } from '@/common/middleWares.js';
import rateLimiter from './utils/rateLimiter.js';
import {
  decrementRemainingUsage,
  resetRateLimit,
} from '@/database/rateLimits.js';
import { validateUserContent } from './utils/validateUserContent.js';
import logError from '@/common/logError.js';

const generalAssistant = Router();

generalAssistant.use(handleAccess);
generalAssistant.use(rateLimiter);
generalAssistant.use(validateUserContent);

generalAssistant.post('/', async (req, res) => {
  try {
    const { user, timestamp, userContent } = req.body;

    if (!userContent) {
      return res.status(400).json({ message: 'Request has no content.' });
    }

    await chatCompletion({
      res,
      userContent,
      sysContent:
        'You are a helpful assistant. Respond in a casual and friendly tone. Prefer vocabulary that people actually uses in a real conversation.',
      temperature: 0.5,
    });

    if (timestamp) {
      await resetRateLimit(user.uid, timestamp);
    }

    await decrementRemainingUsage(user.uid);

    res.end();
  } catch (error) {
    logError(`generalAssistant at @/routes/ai/: ${error}`);
    return res.status(500).send(getOpenAiError(error));
  }
});

export default generalAssistant;
