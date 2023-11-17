import { Router } from 'express';
import { handleCors, handleRateLimit } from '@/common/middleWares.js';
import chatCompletion from './utils/chatCompletion.js';
import { getOpenAiError } from '@/common/getErrorMessage.js';

const eli5 = Router();

eli5.use(handleCors);
eli5.use(handleRateLimit({ max: 100, minutes: 1440 }));

eli5.post('/', async (req, res) => {
  try {
    await chatCompletion({
      res,
      sysContent:
        "Your task is to explain the user's prompt using layperson vocabulary. Break down complex concepts using analogies and by making comparisons to things and events experienced in the day-to-day life of an average person. Avoid the use of jargon, abbreviations, acronyms, slang, and terminologies that require a specific body of knowledge that a layperson might not possess.",
      userContent: req.body,
      temperature: 0.4,
    });

    res.end();
  } catch (error) {
    res.status(res.statusCode).send(`Error: ${getOpenAiError(error)}`);
  }
});

export default eli5;
