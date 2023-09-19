import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

const nodeEnv = process.env.NODE_ENV;
const weatherDomain = process.env.DOMAIN_WEATHER;
const aiDomain = process.env.DOMAIN_AI;

const whitelist = [
  weatherDomain,
  aiDomain,
];

const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

export function handleCors(req, res, next) {
  if (nodeEnv === 'production') {
    cors(corsOptions)(req, res, next);
  } else {
    next();
  }
}

export function handleRateLimit({ max, minutes }) {
  return rateLimit({
    max: max || 5,
    windowMs: minutes * 60000 || 60000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: `Rate limit exceeded. Try again in ${minutes} minutes.` },
  });
}
