import { Router } from 'express';
import needle from 'needle';
import dotenv from 'dotenv';
import apicache from 'apicache';
import { handleCors, handleRateLimit } from '../../utils/middleWares.js';

dotenv.config();

const ipgeoURL = process.env.API_IPGEO_URL;
const keyName = process.env.API_IPGEO_KEY_NAME;
const keyValue = process.env.API_IPGEO_KEY_VALUE;

export async function fetchIpGeo(req) {
  try {
    const params = new URLSearchParams({
      [keyName]: keyValue,
      ip: req.header('X-Real-IP'),
    });

    const ipgeoData = await needle('get', `${ipgeoURL}?${params}`);

    if (ipgeoData.statusCode !== 200) {
      return {
        error: `${ipgeoData.statusCode}: ${ipgeoData.statusMessage}`,
      };
    }

    const data = ipgeoData.body;

    return data;
  } catch (error) {
    throw new Error(error);
  }
}

const ipgeo = Router();
const { middleware } = apicache;
const cache = middleware;

ipgeo.use(handleCors);
ipgeo.use(handleRateLimit({ max: 60, minutes: 180 }));
ipgeo.use(cache('5 minutes'));

ipgeo.get(
  '/',
  async (req, res) => {
    try {
      const data = await fetchIpGeo(req);
      res.json(data);
    } catch (error) {
      res.status(500).json({
        error: '500: An error occurred while fetching geolocation data',
      });
    }
  },
);

export default ipgeo;
