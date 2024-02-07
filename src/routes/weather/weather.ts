import { Router } from 'express';
import apicache from 'apicache';
import currentWeather from './currentWeather.js';
import ipgeo from './ipgeo.js';
import onecall from './onecall.js';
import { handleRateLimit } from '@/common/middleWares.js';

const weather = Router();
const cache = apicache.middleware;
weather.use(handleRateLimit({ max: 60, minutes: 180 }));
weather.use(cache('5 minutes'));

weather.use('/ipgeo', ipgeo);
weather.use('/currentweather', currentWeather);
weather.use('/onecall', onecall);

export default weather;
