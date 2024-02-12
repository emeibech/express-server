import { Router } from 'express';
import chatCompletion from './utils/chatCompletion.js';
import { getOpenAiError } from '@/common/getErrorMessage.js';
import type { Model } from '@/types/ai.js';
import logError from '@/common/logError.js';
import { handleAccess } from '@/common/middleWares.js';
import rateLimiter from './utils/rateLimiter.js';
import { validateUserContent } from './utils/validateUserContent.js';
import {
  decrementRemainingUsage,
  resetRateLimit,
} from '@/database/rateLimits.js';
import type { CustomRequest } from '@/types/common.js';

const codingAssistant = Router();

codingAssistant.use(handleAccess);
codingAssistant.use(rateLimiter);
codingAssistant.use(validateUserContent);

codingAssistant.post('/', async (req: CustomRequest, res) => {
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

    if (!userContent) {
      return res.status(400).json({ message: 'Request has no content.' });
    }

    await chatCompletion({
      res,
      sysContent:
        "You're a programming assistant. You will receive programming questions, requests for suggestions or recommendations, or prompts to generate code. Take as much time as you need to understand the prompt and the code sent to you so you don't hallucinate. When answering questions or making suggestions, always use up-to-date information that follow best practices. When generating code, you should prioritize maintainability and readability over performance unless told otherwise in the prompt.",
      userContent,
      temperature: 0.2,
      model: req.query.model as Model,
    });

    if (timestamp) {
      await resetRateLimit(user.uid, timestamp);
    }

    await decrementRemainingUsage(user.uid);

    res.end();
  } catch (error) {
    res.status(500).send(getOpenAiError(error));
    logError(`codingAssistant at @/routes/ai/: ${error}`);
  }
});

export default codingAssistant;
