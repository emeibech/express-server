import cors, { CorsOptions, CorsRequest } from 'cors';
import { NextFunction, Response } from 'express';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

const nodeEnv = process.env.NODE_ENV;
const weatherDomain = process.env.DOMAIN_WEATHER;
const aiDomain = process.env.DOMAIN_AI;
const whitelist = [weatherDomain, aiDomain];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

export function handleCors(
  req: CorsRequest,
  res: Response,
  next: NextFunction,
) {
  if (nodeEnv === 'production') {
    cors(corsOptions)(req, res, next);
  } else {
    cors()(req, res, next);
  }
}

export interface HandleRateLimitParams {
  max: number;
  minutes: number;
}

export function handleRateLimit({ max, minutes }: HandleRateLimitParams) {
  return rateLimit({
    max: max || 5,
    windowMs: minutes * 60000 || 60000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: `Rate limit exceeded. Try again in ${minutes} minutes.` },
  });
}
