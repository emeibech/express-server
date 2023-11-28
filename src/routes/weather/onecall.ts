import { Request, Response, Router } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import { type OneCallDataResponse } from './currentWeather.js';
import { getAxiosError } from '@/common/getErrorMessage.js';

dotenv.config();

const oneCallUrl = process.env.API_OW_ONECALL_URL;
const keyName = process.env.API_OW_KEY_NAME ?? 'APPID';
const keyValue = process.env.API_OW_KEY_VALUE ?? '';

export async function fetchOnecall(req: Request) {
  try {
    const oneCallParams = new URL(req.url, `http://${req.headers.host}`)
      .searchParams;

    oneCallParams.append('exclude', 'minutely,alerts');
    oneCallParams.append(keyName, keyValue);

    const oneCallData = await axios<OneCallDataResponse>(
      `${oneCallUrl}?${oneCallParams}`,
    );

    if (oneCallData.status !== 200) {
      return {
        error: `${oneCallData.data.cod}: ${oneCallData.data.message}`,
      };
    }

    return {
      ...oneCallData.data,
      hourly: { pop: oneCallData.data.hourly[1].pop },
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

const onecall = Router();

onecall.get('/', async (req: Request, res: Response) => {
  try {
    const weatherData = await fetchOnecall(req);
    res.json(weatherData);
  } catch (error) {
    res.status(res.statusCode).json(getAxiosError(error));
  }
});

export default onecall;
