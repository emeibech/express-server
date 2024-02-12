import type { Request } from 'express';

export interface TokenPayload {
  uid: number;
  sid: string;
  iat: number;
  exp: number;
}

export interface CustomRequest extends Request {
  user?: TokenPayload;
  timestamp?: number;
}
