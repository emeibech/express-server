import { ChatCompletionOptions } from '@/types/ai.js';
import openai from './openaiConfig.js';
import logError from '@/common/logError.js';

const chatCompletion = async ({
  res,
  sysContent,
  userContent,
  temperature,
  model,
}: ChatCompletionOptions) => {
  try {
    const stream = await openai.chat.completions.create({
      temperature,
      stream: true,
      model: model || 'gpt-4-turbo-2024-04-09',
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
  } catch (error) {
    logError(`chatCompletion at @/routes/ai/utils/: ${error}`);
  }
};

export default chatCompletion;
