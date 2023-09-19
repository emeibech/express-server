import { Router } from 'express';
import needle from 'needle';
import dotenv from 'dotenv';
import apicache from 'apicache';
import { handleCors, handleRateLimit } from '../../utils/middleWares.js';

dotenv.config();

const oneCallUrl = process.env.API_OW_ONECALL_URL;
const keyName = process.env.API_OW_KEY_NAME;
const keyValue = process.env.API_OW_KEY_VALUE;

export async function fetchOnecall(req) {
  try {
    const oneCallParams = new URL(req.url, `http://${req.headers.host}`)
      .searchParams;

    oneCallParams.append('exclude', 'minutely,alerts');
    oneCallParams.append(keyName, keyValue);

    const oneCallData = await needle('get', `${oneCallUrl}?${oneCallParams}`);

    if (oneCallData.statusCode !== 200) {
      return {
        error: `${oneCallData.body.cod}: ${oneCallData.body.message}`,
      };
    }

    return {
      ...oneCallData.body,
      hourly: { pop: oneCallData.body.hourly[1].pop },
    };
  } catch (error) {
    console.error(error);
  }
}

const onecall = Router();
const { middleware } = apicache;
const cache = middleware;

onecall.use(handleCors);
onecall.use(handleRateLimit({ max: 60, minutes: 180 }));
onecall.use(cache('5 minutes'));

onecall.get(
  '/',
  async (req, res) => {
    try {
      const weatherData = await fetchOnecall(req);
      res.json(weatherData);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: '500: An error occurred while fetching weather data',
      });
    }
  },
);

export default onecall;
