import { Router } from 'express';
import { handleCors, handleRateLimit } from '@/common/middleWares.js';
import chatCompletion from './utils/chatCompletion.js';
import { getOpenAiError } from '@/common/getErrorMessage.js';

const storyGenerator = Router();

storyGenerator.use(handleCors);
storyGenerator.use(handleRateLimit({ max: 100, minutes: 1440 }));

storyGenerator.post('/', async (req, res) => {
  try {
    await chatCompletion({
      res,
      sysContent:
        "Your task is to generate a fictional story based on the user's prompt. The prompt may contain the subject matter, the style in which you will write the story, and some user-provided context about the subject. Imply the user-provided context instead of mentioning them. Construct concise sentences. Avoid repeating yourself. Balance periodic sentences with loose sentences. Avoid cliches like 'once upon a time,' 'in the faraway land,' 'whispers of,' 'legends speak of,' and other phrases that makes the story sound like a fairy tale. Write in a modern, contemporary tone.",
      userContent: req.body,
      temperature: 0.7,
    });

    res.end();
  } catch (error) {
    res.status(res.statusCode).send(`Error: ${getOpenAiError(error)}`);
  }
});

export default storyGenerator;
