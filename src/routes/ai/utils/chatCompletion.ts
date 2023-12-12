import { ChatCompletionOptions } from '@/types/ai.js';
import openai from './openaiConfig.js';

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
