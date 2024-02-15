import { Router } from 'express';
import chatCompletion from './utils/chatCompletion.js';
import { getOpenAiError } from '@/common/getErrorMessage.js';
import logError from '@/common/logError.js';
import { handleAccess } from '@/common/middleWares.js';
import rateLimiter from './utils/rateLimiter.js';
import { validateUserContent } from './utils/validateUserContent.js';
import {
  decrementRemainingUsage,
  resetRateLimit,
} from '@/database/rateLimits.js';
import type { CustomRequest } from '@/types/common.js';

const codeAnalyzer = Router();

codeAnalyzer.use(handleAccess);
codeAnalyzer.use(rateLimiter);
codeAnalyzer.use(validateUserContent);

codeAnalyzer.post('/', async (req: CustomRequest, res) => {
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
        "You are going to receive a prompt that contains code. Your task is to explain what the code does.\n\nCarefully follow these instructions in your response: \n1. Analyze the prompt. Take as much time as you need.\n2. If the prompt contains no code, respond by saying that you're a code analyzer and expects to receive code in the prompt.\n4. Provide a summary of what the code does.\n3. Provide a line-by-line breakdown of the code.",
      temperature: 0.2,
    });

    if (timestamp) {
      await resetRateLimit(user, timestamp);
    }

    await decrementRemainingUsage(user);

    res.end();
  } catch (error) {
    res.status(500).send(getOpenAiError(error));
    logError(`codeAnalyzer at @/routes/ai/: ${error}`);
  }
});

export default codeAnalyzer;
