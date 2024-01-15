import { Request, Response, Router } from 'express';
import axios from 'axios';
import { getAxiosError } from '@/common/getErrorMessage.js';

const ipgeoURL = process.env.API_IPGEO_URL;
const keyName = 'apiKey';
const keyValue = process.env.API_IPGEO_KEY_VALUE ?? '';

export async function fetchIpGeo(req: Request) {
  const params = new URLSearchParams();
  params.append(keyName, keyValue);
  params.append('ip', req.header('X-Real-IP') || req.ip || '');

  const ipgeoData = await axios.get<unknown>(`${ipgeoURL}?${params}`);

  if (ipgeoData.status !== 200) {
    return {
      error: `${ipgeoData.status}: ${ipgeoData.statusText}`,
    };
  }

  return ipgeoData.data;
}

const ipgeo = Router();

ipgeo.get('/', async (req: Request, res: Response) => {
  try {
    const data = await fetchIpGeo(req);
    res.json(data);
  } catch (error) {
    res.status(res.statusCode).json(getAxiosError(error));
  }
});

export default ipgeo;
