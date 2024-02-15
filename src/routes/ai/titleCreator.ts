import { getOpenAiError } from '@/common/getErrorMessage.js';
import { Router } from 'express';
import noStreamChatCompletion from './utils/noStreamCompletion.js';
import logError from '@/common/logError.js';
import { validateUserContent } from './utils/validateUserContent.js';
import { handleAccess } from '@/common/middleWares.js';

const titleCreator = Router();
titleCreator.use(handleAccess);
titleCreator.use(validateUserContent);

titleCreator.post('/', async (req, res) => {
  try {
    const userContent = req.body.userContent;

    await noStreamChatCompletion({
      res,
      sysContent:
        'Create a concise title for the conversation. The title should not exceed fifty characters.',
      userContent,
      temperature: 0.5,
    });

    res.end();
  } catch (error) {
    res.status(500).send(getOpenAiError(error));
    logError(`titleCreator at @/routes/ai/: ${error}`);
  }
});

export default titleCreator;
