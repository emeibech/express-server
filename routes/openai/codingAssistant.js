import { Router } from 'express';
import apicache from 'apicache';
import { handleCors, handleRateLimit } from '../../utils/middleWares.js';
import chatCompletion from './utils/chatCompletion.js';

const codingAssistant = Router();
const { middleware } = apicache;
const cache = middleware;

codingAssistant.use(handleCors);
codingAssistant.use(handleRateLimit({ max: 10, minutes: 1440 }));
codingAssistant.use(cache('5 minutes'));

codingAssistant.get('/', async (req, res) => {
  try {
    await chatCompletion({
      res,
      sysContent: 'You are a programming assistant. You will receive programming questions, requests for suggestions or recommendations, or prompts to generate code. When answering questions or making suggestions, be sure to use up-to-date information that follow best practices. When generating code, before sending back your response, you must first check your generated code for errors. Important note: The generated code should prioritize maintainability and readability over performance unless told otherwise in the prompt. Be sure to follow best practices.',
      userContent: req.query.prompt,
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

export default codingAssistant;
