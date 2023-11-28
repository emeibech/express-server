import { Router } from 'express';
import chatCompletion from './utils/chatCompletion.js';
import { getOpenAiError } from '@/common/getErrorMessage.js';

const generalAssistant = Router();

generalAssistant.post('/', async (req, res) => {
  try {
    await chatCompletion({
      res,
      sysContent:
        'You are a helpful assistant. Respond in a casual and friendly tone. Prefer vocabulary that people actually uses in a real conversation.',
      userContent: req.body,
      temperature: 0.5,
    });

    res.end();
  } catch (error) {
    res.status(res.statusCode).send(`Error: ${getOpenAiError(error)}`);
  }
});

export default generalAssistant;
