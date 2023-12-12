import { Router } from 'express';
import chatCompletion from './utils/chatCompletion.js';
import { getOpenAiError } from '@/common/getErrorMessage.js';
import type { Model } from '@/types/ai.js';

const codingAssistant = Router();

codingAssistant.post('/', async (req, res) => {
  try {
    await chatCompletion({
      res,
      sysContent:
        "You're a programming assistant. You will receive programming questions, requests for suggestions or recommendations, or prompts to generate code. Take as much time as you need to understand the prompt and the code sent to you so you don't hallucinate. When answering questions or making suggestions, always use up-to-date information that follow best practices. When generating code, you should prioritize maintainability and readability over performance unless told otherwise in the prompt.",
      userContent: req.body.userContent,
      temperature: 0.2,
      model: req.query.model as Model,
    });

    res.end();
  } catch (error) {
    res.status(500).send(getOpenAiError(error));
  }
});

export default codingAssistant;
