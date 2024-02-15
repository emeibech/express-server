import type { Request } from 'express';

export interface TokenPayload {
  uid: number;
  iat: number;
  exp: number;
}

export interface CustomRequest extends Request {
  user?: number;
  timestamp?: number;
}

export interface GenerateAct {
  userId: number;
  rft: number;
}
