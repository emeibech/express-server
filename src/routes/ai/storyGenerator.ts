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

const storyGenerator = Router();

storyGenerator.use(handleAccess);
storyGenerator.use(rateLimiter);
storyGenerator.use(validateUserContent);

storyGenerator.post('/', async (req: CustomRequest, res) => {
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
      userContent,
      sysContent:
        "Your task is to generate a fictional story based on the user's prompt. The prompt may contain the subject matter, the style in which you will write the story, and some user-provided context about the subject. Imply the user-provided context instead of mentioning them. Construct concise sentences. Avoid repeating yourself. Balance periodic sentences with loose sentences. Avoid cliches like 'once upon a time,' 'in the faraway land,' 'whispers of,' 'legends speak of,' and other phrases that makes the story sound like a fairy tale. Write in a modern, contemporary tone.",
      temperature: 0.7,
    });

    if (timestamp) {
      await resetRateLimit(user.uid, timestamp);
    }

    await decrementRemainingUsage(user.uid);

    res.end();
  } catch (error) {
    res.status(500).send(getOpenAiError(error));
    logError(`storyGenerator at @/routes/ai/: ${error}`);
  }
});

export default storyGenerator;
