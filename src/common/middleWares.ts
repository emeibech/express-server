import dotenv from 'dotenv';
import cors, { CorsOptions, CorsRequest } from 'cors';
import rateLimit from 'express-rate-limit';
import { verifyToken } from './utils.js';
import { verifySession } from '@/database/session.js';
import type { NextFunction, Request, Response } from 'express';

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

export async function handleAccess(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(401).json({ error: 'Access unauthorized.' });
    }

    const { error, payload } = await verifyToken(token);

    if (error) return res.status(401).json({ error });

    const isSessionValid = await verifySession(payload?.sessionId);

    if (!isSessionValid) {
      return res.status(401).json({ error: 'Session has expired.' });
    }

    req.body.user = payload;

    next();
  } catch (error) {
    next(error);
  }
}

export function handleRouteError(
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  res.status(res.statusCode).json({
    [err.name]: err.message,
  });

  next();
}
