import { z } from 'zod';
import type { NextFunction, Request, Response } from 'express';
import logError from '@/common/logError.js';

const userContentSchema = z.array(
  z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  }),
);

export function validateUserContent(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { userContent } = req.body;
    const parsed = userContentSchema.safeParse(userContent);

    if (!parsed.success) {
      return res.status(400).json({
        message:
          "TypeError: userContent should be an array of objects. { role: 'user' | 'assistant', content: string }[]",
      });
    }

    next();
  } catch (error) {
    logError(`validateUserContent at @/routes/ai/utils: ${error}`);
  }
}
