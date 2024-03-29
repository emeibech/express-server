import { z } from 'zod';
import type { NextFunction, Request, Response } from 'express';
import logError from '@/common/logError.js';

const messagesSchema = z.array(
  z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  }),
);

export function validateMessages(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { messages } = req.body;
    const parsed = messagesSchema.safeParse(messages);

    if (!parsed.success) {
      return res.status(400).json({
        message:
          "TypeError: Messages should be an array of objects with shape { role: 'user' | 'assistant', content: string }[]",
      });
    }

    next();
  } catch (error) {
    logError(`validateMessages at @/routes/conversations/messages: ${error}`);
  }
}
