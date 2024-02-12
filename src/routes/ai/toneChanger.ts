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

const toneChanger = Router();

toneChanger.use(handleAccess);
toneChanger.use(rateLimiter);
toneChanger.use(validateUserContent);

toneChanger.post('/', async (req: CustomRequest, res) => {
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
        'You will receive two sets of text, one labeled "tone" and the other "message." The value of tone(label) can be a particular tone, e.g., sarcastic, or a particular type of person, e.g., medieval knight. Your task is to transform the message so that it is written in a particular tone, or as if it was written by a particular type of person. Be subtle with your response. Do not include what tone you are supposed to be written in or what type of person is the supposed writer.',
      temperature: 0.3,
    });

    if (timestamp) {
      await resetRateLimit(user.uid, timestamp);
    }

    await decrementRemainingUsage(user.uid);

    res.end();
  } catch (error) {
    res.status(500).send(getOpenAiError(error));
    logError(`toneChanger at @/routes/ai/: ${error}`);
  }
});

export default toneChanger;
