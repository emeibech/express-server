import { Router } from 'express';
import apicache from 'apicache';
import { handleCors, handleRateLimit } from '@/common/middleWares.js';
import chatCompletion from './utils/chatCompletion.js';
import { getOpenAiError } from '@/common/getErrorMessage.js';

const toneChanger = Router();
const { middleware } = apicache;
const cache = middleware;

toneChanger.use(handleCors);
toneChanger.use(handleRateLimit({ max: 10, minutes: 1440 }));
toneChanger.use(cache('5 minutes'));

toneChanger.get('/', async (req, res) => {
  try {
    await chatCompletion({
      res,
      sysContent:
        'You will receive two sets of text, one labeled "tone" and the other "message." The value of tone(label) can be a particular tone, e.g., sarcastic, or a particular type of person, e.g., medieval knight. Your task is to transform the message so that it is written in a particular tone, or as if it was written by a particular type of person. Important note: Be subtle with your response. Do not include what tone you are supposed to be written in or what type of person is the supposed writer.',
      userContent: `tone:"${req.query.tone}" message:"${req.query.message}"`,
      temperature: 0.3,
    });

    res.end();
  } catch (error) {
    res.status(res.statusCode).json({
      error: getOpenAiError(error),
    });
  }
});

export default toneChanger;
