import { getOpenAiError } from '@/common/getErrorMessage.js';
import { Router } from 'express';
import noStreamChatCompletion from './utils/noStreamCompletion.js';
const titleCreator = Router();

titleCreator.post('/', async (req, res) => {
  try {
    await noStreamChatCompletion({
      res,
      sysContent:
        'Create a concise title for the conversation. The title should not exceed fifty characters.',
      userContent: req.body.userContent,
      temperature: 0.5,
    });

    res.end();
  } catch (error) {
    res.status(500).send(getOpenAiError(error));
  }
});

export default titleCreator;
