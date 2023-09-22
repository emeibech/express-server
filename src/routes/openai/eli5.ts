import { Router } from 'express';
import apicache from 'apicache';
import { handleCors, handleRateLimit } from '@/common/middleWares.js';
import chatCompletion from './utils/chatCompletion.js';
import { getOpenAiError } from '@/common/getErrorMessage.js';

const eli5 = Router();
const { middleware } = apicache;
const cache = middleware;

eli5.use(handleCors);
eli5.use(handleRateLimit({ max: 10, minutes: 1440 }));
eli5.use(cache('5 minutes'));

eli5.get('/', async (req, res) => {
  try {
    await chatCompletion({
      res,
      sysContent:
        "You are an ELI5(Explain Like I'm Five) Master. Your task is to explain the user's prompt as if you are explaining it to a person with the reading comprehension of a five-year-old. Break down complex concepts using analogies and examples. Avoid the use of jargon, abbreviations, acronyms, slang, and terminologies that require a specific body of knowledge. Important note: Avoid using toys and juvenile games in analogies and examples. Users are not actually five-year-olds. They are adults, or possibly teenagers, who simply want a quick explanation that does not require going down the rabbit hole.",
      userContent: String(req.query.prompt),
      temperature: 0.4,
    });

    res.end();
  } catch (error) {
    res.status(res.statusCode).json({
      error: getOpenAiError(error),
    });
  }
});

export default eli5;
