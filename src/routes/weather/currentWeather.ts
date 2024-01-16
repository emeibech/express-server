import { Request, Response, Router } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import { getAxiosError } from '@/common/getErrorMessage.js';

dotenv.config();

const weatherUrl = process.env.API_OW_WEATHER_URL;
const oneCallUrl = process.env.API_OW_ONECALL_URL;
const keyName = 'APPID';
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

const currentWeather = Router();

currentWeather.get('/', async (req: Request, res: Response) => {
  try {
    const weatherData = await fetchWeather(req);
    res.status(200).json(weatherData);
  } catch (error) {
    res.status(500).json(getAxiosError(error));
  }
});

export default currentWeather;
