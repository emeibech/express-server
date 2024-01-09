import openai from './openaiConfig.js';
import { ChatCompletionOptions } from '@/types/ai.js';

const noStreamChatCompletion = async ({
  res,
  sysContent,
  userContent,
  temperature,
  model,
}: ChatCompletionOptions) => {
  const stream = await openai.chat.completions.create({
    temperature,
    model: model || 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: sysContent,
      },
      ...userContent,
    ],
  });

  const data = stream.choices[0].message.content;
  res.status(200).json({ message: data });
};

export default noStreamChatCompletion;
