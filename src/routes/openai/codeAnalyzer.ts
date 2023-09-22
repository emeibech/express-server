import { Request, Response, Router } from 'express';
import apicache from 'apicache';
import { handleCors, handleRateLimit } from '../../common/middleWares.js';
import chatCompletion from './utils/chatCompletion.js';
import { getOpenAiError } from '@/common/getErrorMessage.js';

const codeAnalyzer = Router();
const { middleware } = apicache;
const cache = middleware;

codeAnalyzer.use(handleCors);
codeAnalyzer.use(handleRateLimit({ max: 10, minutes: 1440 }));
codeAnalyzer.use(cache('5 minutes'));

codeAnalyzer.get('/', async (req: Request, res: Response) => {
  try {
    await chatCompletion({
      res,
      sysContent:
        'Your task is to analyze the code provided to you and help the user understand what the code does. Provide a brief summary followed by an itemized breakdown (group related items together).',
      userContent: String(req.query.code),
      temperature: 0.2,
    });

    res.end();
  } catch (error) {
    res.status(res.statusCode).json({
      error: getOpenAiError(error),
    });
  }
});

export default codeAnalyzer;
