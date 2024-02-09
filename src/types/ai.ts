import type { Response } from 'express';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/index.mjs';

export type Model = 'gpt-4' | 'gpt-3.5-turbo-16k';

export interface ChatCompletionOptions {
  res: Response;
  sysContent: string;
  userContent: ChatCompletionMessageParam[];
  temperature: 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7;
  model?: Model;
}

export interface VisionPreviewOptions {
  res: Response;
  url: string;
  userContent?: string;
  sysContent: string;
}
