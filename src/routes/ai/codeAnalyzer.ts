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

const codeAnalyzer = Router();

codeAnalyzer.use(handleAccess);
codeAnalyzer.use(rateLimiter);
codeAnalyzer.use(validateUserContent);

codeAnalyzer.post('/', async (req, res) => {
  try {
    const { user, timestamp, userContent } = req.body;

    if (!userContent) {
      return res.status(400).json({ message: 'Request has no content.' });
    }

    await chatCompletion({
      res,
      userContent,
      sysContent:
        "You are going to receive a prompt that contains code. Your task is to explain what the code does.\n\nCarefully follow these instructions in your response: \n1. Analyze the prompt. Take as much time as you need.\n2. If the prompt contains no code, respond by saying that you're a code analyzer and expects to receive code in the prompt.\n4. Provide a summary of what the code does.\n3. Provide a line-by-line breakdown of the code.",
      temperature: 0.2,
    });

    if (timestamp) {
      await resetRateLimit(user.uid, timestamp);
    }

    await decrementRemainingUsage(user.uid);

    res.end();
  } catch (error) {
    res.status(500).send(getOpenAiError(error));
    logError(`codeAnalyzer at @/routes/ai/: ${error}`);
  }
});

export default codeAnalyzer;
