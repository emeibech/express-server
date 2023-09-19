import { Router } from 'express';
import apicache from 'apicache';
import { handleCors, handleRateLimit } from '../../utils/middleWares.js';
import chatCompletion from './utils/chatCompletion.js';

const codeAnalyzer = Router();
const { middleware } = apicache;
const cache = middleware;

codeAnalyzer.use(handleCors);
codeAnalyzer.use(handleRateLimit({ max: 10, minutes: 1440 }));
codeAnalyzer.use(cache('5 minutes'));

codeAnalyzer.get('/', async (req, res) => {
  try {
    await chatCompletion({
      res,
      sysContent: 'Your task is to analyze the code provided to you and help the user understand what the code does. Provide a brief summary followed by an itemized breakdown (group related items together).',
      userContent: req.query.code,
      temperature: 0.2,
    });

    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: '500: An error occurred while fetching openai data',
    });
  }
});

export default codeAnalyzer;
