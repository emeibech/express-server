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

const eli5 = Router();

eli5.use(handleAccess);
eli5.use(rateLimiter);
eli5.use(validateUserContent);

eli5.post('/', async (req, res) => {
  try {
    const { user, timestamp, userContent } = req.body;

    if (!userContent) {
      return res.status(400).json({ message: 'Request has no content.' });
    }

    await chatCompletion({
      res,
      sysContent:
        "Your task is to explain the user's prompt using layperson vocabulary. Break down complex concepts using analogies and by making comparisons to things and events experienced in the day-to-day life of an average person. Avoid the use of jargon, abbreviations, acronyms, slang, and terminologies that require a specific body of knowledge that a layperson might not possess.",
      userContent: req.body.userContent,
      temperature: 0.4,
    });

    if (timestamp) {
      await resetRateLimit(user.uid, timestamp);
    }

    await decrementRemainingUsage(user.uid);

    res.end();
  } catch (error) {
    res.status(500).send(getOpenAiError(error));
    logError(`eli5 at @/routes/ai/: ${error}`);
  }
});

export default eli5;
