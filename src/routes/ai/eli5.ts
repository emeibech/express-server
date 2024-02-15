import chatCompletion from './utils/chatCompletion.js';
import { getOpenAiError } from '@/common/getErrorMessage.js';
import logError from '@/common/logError.js';
import { Router } from 'express';
import { handleAccess } from '@/common/middleWares.js';
import rateLimiter from './utils/rateLimiter.js';
import { validateUserContent } from './utils/validateUserContent.js';
import {
  decrementRemainingUsage,
  resetRateLimit,
} from '@/database/rateLimits.js';
import type { CustomRequest } from '@/types/common.js';

const eli5 = Router();

eli5.use(handleAccess);
eli5.use(rateLimiter);
eli5.use(validateUserContent);

eli5.post('/', async (req: CustomRequest, res) => {
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
        "Your task is to explain the user's prompt using layperson vocabulary. Break down complex concepts using analogies and by making comparisons to things and events experienced in the day-to-day life of an average person. Avoid the use of jargon, abbreviations, acronyms, slang, and terminologies that require a specific body of knowledge that a layperson might not possess.",
      temperature: 0.4,
    });

    if (timestamp) {
      await resetRateLimit(user, timestamp);
    }

    await decrementRemainingUsage(user);

    res.end();
  } catch (error) {
    res.status(500).send(getOpenAiError(error));
    logError(`eli5 at @/routes/ai/: ${error}`);
  }
});

export default eli5;
