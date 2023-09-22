import { Router } from 'express';
import apicache from 'apicache';
import { handleCors, handleRateLimit } from '@/common/middleWares.js';
import chatCompletion from './utils/chatCompletion.js';
import { getOpenAiError } from '@/common/getErrorMessage.js';

const storyGenerator = Router();
const { middleware } = apicache;
const cache = middleware;

storyGenerator.use(handleCors);
storyGenerator.use(handleRateLimit({ max: 10, minutes: 1440 }));
storyGenerator.use(cache('5 minutes'));

storyGenerator.get('/', async (req, res) => {
  try {
    await chatCompletion({
      res,
      sysContent:
        "Your task is to generate a fictional story based on the user's prompt. The prompt will contain the subject matter, the style in which you will write the story, and some user-provided context about the subject. Make sure to imply the user-provided context instead of mentioning them directly in the story. Invent names, history, culture, language, or even new concepts to make the story more engaging. Important note: Construct concise sentences and avoid repeating yourself. Balance periodic sentences with loose sentences.",
      userContent: String(req.query.prompt),
      temperature: 0.7,
    });

    res.end();
  } catch (error) {
    res.status(res.statusCode).json({
      error: getOpenAiError(error),
    });
  }
});

export default storyGenerator;
