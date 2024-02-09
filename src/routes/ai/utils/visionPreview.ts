import { VisionPreviewOptions } from '@/types/ai.js';
import openai from './openaiConfig.js';
import logError from '@/common/logError.js';

const visionPreview = async ({
  res,
  url,
  userContent,
  sysContent,
}: VisionPreviewOptions) => {
  try {
    const stream = await openai.chat.completions.create({
      stream: true,
      model: 'gpt-4-vision-preview',
      max_tokens: 1000,
      temperature: 0.5,
      messages: [
        {
          role: 'system',
          content: sysContent,
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: userContent ?? '' },
            {
              type: 'image_url',
              image_url: {
                url,
                detail: 'low',
              },
            },
          ],
        },
      ],
    });

    res.setHeader('Content-Type', 'text/plain');

    for await (const chunk of stream) {
      const message = chunk.choices[0]?.delta?.content ?? '';
      res.write(message);
    }
  } catch (error) {
    logError(`visionPreview at @/routes/ai/utils/: ${error}`);
  }
};

export default visionPreview;
