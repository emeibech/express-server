import dotenv from 'dotenv';
import cors, { CorsOptions } from 'cors';
import rateLimit from 'express-rate-limit';
import { decodeToken, generateAct, verifyToken } from './utils.js';
import type { NextFunction, Response } from 'express';
import type { HandleRateLimitParams } from '@/types/middlewares.js';
import type { CustomRequest } from '@/types/common.js';
import { deleteRft, verifyRft } from '@/database/refreshTokens.js';
import logError from './logError.js';

dotenv.config();

const nodeEnv = process.env.NODE_ENV;
const localhost = process.env.LOCALHOST;
const weatherDomain = process.env.DOMAIN_WEATHER;
const aiDomain = process.env.DOMAIN_AI;
const mainSite = process.env.DOMAIN_MAIN;
const whitelist = [weatherDomain, aiDomain, mainSite];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

export function handleCors(
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) {
  if (nodeEnv === 'production') {
    cors(corsOptions)(req, res, next);
  } else {
    cors({ origin: localhost, credentials: true })(req, res, next);
  }
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
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const act = req.signedCookies.act;

    if (!act) {
      return res.status(401).json({ message: 'Access unauthorized.' });
    }

    const { error, payload, expired } = await verifyToken(act);

    if (payload) {
      req.user = payload.uid;
      return next();
    }

    const { uid, rft } = decodeToken(act);

    if (error) {
      logError(`handleAccess @/common/middlWares: ${error}`);
      return res.status(500).json({ message: error });
    }

    if (expired) {
      const isRftValid = await verifyRft(rft);

      if (isRftValid) {
        const token = await generateAct({ userId: uid, rft });
        req.user = uid;

        res.cookie('act', token, {
          httpOnly: true,
          sameSite: 'strict',
          secure: nodeEnv === 'production',
          signed: true,
        });

        return next();
      } else {
        await deleteRft(rft);
        res.clearCookie('act');
        return res.status(403).json({ message: 'Refresh token has expired.' });
      }
    }
  } catch (error) {
    next(error);
  }
}
