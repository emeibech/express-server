import { Request, Response, Router } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import apicache from 'apicache';
import { handleCors, handleRateLimit } from '@/common/middleWares.js';
import { getAxiosError } from '@/common/getErrorMessage.js';

dotenv.config();

const weatherUrl = process.env.API_OW_WEATHER_URL;
const oneCallUrl = process.env.API_OW_ONECALL_URL;
const keyName = process.env.API_OW_KEY_NAME ?? 'APPID';
const keyValue = process.env.API_OW_KEY_VALUE ?? '';

export interface WeatherDataResponse {
  cod?: number;
  message?: string;
  coord: { lat: number; lon: number };
  sys: { country: string };
}

export interface OneCallDataResponse {
  cod?: number;
  message?: string;
  hourly: [{ pop: number }, { pop: number }];
}

export async function fetchWeather(req: Request) {
  const weatherParams = new URL(req.url, `http://${req.headers.host}`)
    .searchParams;

  weatherParams.append(keyName, keyValue);

  const weatherData = await axios.get<WeatherDataResponse>(
    `${weatherUrl}?${weatherParams}`,
  );

  const { lat, lon } = weatherData.data.coord;
  const { country } = weatherData.data.sys;

  const forecastParams = new URLSearchParams();
  forecastParams.append(keyName, keyValue);
  forecastParams.append('exclude', 'minutely');
  forecastParams.append('lat', `${lat}`);
  forecastParams.append('lon', `${lon}`);

  const forecastData = await axios.get<OneCallDataResponse>(
    `${oneCallUrl}?${forecastParams}`,
  );

  const data = {
    ...forecastData.data,
    hourly: { pop: forecastData.data.hourly[1].pop },
    sys: { country },
  };

  return data;
}

const weather = Router();
const { middleware } = apicache;
const cache = middleware;

weather.use(cache('5 minutes'));
weather.use(handleCors);
weather.use(handleRateLimit({ max: 60, minutes: 180 }));

weather.get('/', async (req: Request, res: Response) => {
  try {
    const weatherData = await fetchWeather(req);
    res.json(weatherData);
  } catch (error) {
    res.status(res.statusCode).json(getAxiosError(error));
  }
});

export default weather;
