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
import type { CustomRequest } from '@/types/common.js';

const generalAssistant = Router();

generalAssistant.use(handleAccess);
generalAssistant.use(rateLimiter);
generalAssistant.use(validateUserContent);

generalAssistant.post('/', async (req: CustomRequest, res) => {
  try {
    const userContent = req.body.userContent;
    const user = req.user;
    const timestamp = req.timestamp;

    if (!user) {
      logError('imageTranslator at @/routes/ai/: user is undefined.');
      return res
        .status(500)
        .json({ message: 'An error occured in the server.' });
    }

    await chatCompletion({
      res,
      userContent,
      sysContent:
        'You are a helpful assistant. Respond in a casual and friendly tone. Prefer vocabulary that people actually uses in a real conversation.',
      temperature: 0.5,
    });

    if (timestamp) {
      await resetRateLimit(user, timestamp);
    }

    await decrementRemainingUsage(user);

    res.end();
  } catch (error) {
    res.status(500).send(getOpenAiError(error));
    logError(`generalAssistant at @/routes/ai/: ${error}`);
  }
});

export default generalAssistant;
