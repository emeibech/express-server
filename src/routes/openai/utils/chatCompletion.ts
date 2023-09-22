import { Response } from 'express';
import openai from './openaiConfig.js';

export interface ChatCompletionOptions {
  res: Response;
  sysContent: string;
  userContent: string;
  temperature: 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7;
}

const chatCompletion = async ({
  res,
  sysContent,
  userContent,
  temperature,
}: ChatCompletionOptions) => {
  const stream = await openai.chat.completions.create({
    temperature,
    stream: true,
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: sysContent,
      },
      {
        role: 'user',
        content: userContent,
      },
    ],
  });

  res.setHeader('Content-Type', 'text/plain');

  for await (const chunk of stream) {
    const message = chunk.choices[0]?.delta?.content ?? '';
    res.write(message);
  }
};

export default chatCompletion;
