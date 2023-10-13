import { Request, Response, Router } from 'express';
import { handleCors, handleRateLimit } from '../../common/middleWares.js';
import chatCompletion from './utils/chatCompletion.js';
import { getOpenAiError } from '@/common/getErrorMessage.js';

const codeAnalyzer = Router();

codeAnalyzer.use(handleCors);
codeAnalyzer.use(handleRateLimit({ max: 100, minutes: 1440 }));

codeAnalyzer.post('/', async (req: Request, res: Response) => {
  try {
    await chatCompletion({
      res,
      sysContent:
        "You are going to receive a prompt that contains code. Your task is to analyze that code.\n\nCarefully follow these instructions in your response: \n1. If there is no code in the prompt, respond by saying that you're a code analyzer and expects to receive code in the prompt.\n2. Infer the language used in the code.\n3. Analyze what the code does. Take as much time as you need.\n4. Provide a brief summary of the code followed by an itemized breakdown with related items grouped together.\n5. Respond in this exact format: \n```language\ncode prompt\n```\n\nSummary\n\nBreakdown",
      userContent: req.body,
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
