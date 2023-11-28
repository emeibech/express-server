import { Response } from 'express';
import openai from './openaiConfig.js';
import { ChatCompletionMessageParam } from 'openai/resources/chat/index.mjs';

export type Model = 'gpt-4' | 'gpt-3.5-turbo-16k';

export interface ChatCompletionOptions {
  res: Response;
  sysContent: string;
  userContent: ChatCompletionMessageParam[];
  temperature: 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7;
  model?: Model;
}

const chatCompletion = async ({
  res,
  sysContent,
  userContent,
  temperature,
  model,
}: ChatCompletionOptions) => {
  const stream = await openai.chat.completions.create({
    temperature,
    stream: true,
    model: model || 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: sysContent,
      },
      ...userContent,
    ],
  });

  res.setHeader('Content-Type', 'text/plain');

  for await (const chunk of stream) {
    const message = chunk.choices[0]?.delta?.content ?? '';
    res.write(message);
  }
};

export default chatCompletion;
