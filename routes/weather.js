const needle = require('needle');
const ipgeo = require('./ipgeo');
require('dotenv').config();

const weatherUrl = process.env.API_OW_WEATHER_URL;
const oneCallUrl = process.env.API_OW_ONECALL_URL;
const keyName = process.env.API_OW_KEY_NAME;
const keyValue = process.env.API_OW_KEY_VALUE;

const weather = async (req) => {
  try {
    const weatherParams = new URL(req.url, `http://${req.headers.host}`)
      .searchParams;

    weatherParams.append(keyName, keyValue);

    const weatherData = await needle('get', `${weatherUrl}?${weatherParams}`);
    const lat = weatherData.body.coord.lat;
    const lon = weatherData.body.coord.lon;

    const forecastParams = new URLSearchParams({
      [keyName]: keyValue,
      exclude: 'current,minutely,hourly,alerts',
      lat,
      lon,
    });

    const forecastData = await needle('get', `${oneCallUrl}?${forecastParams}`);

    const data = {
      weatherData: weatherData.body,
      forecastData: forecastData.body,
    };

    return data;
  } catch (error) {
    console.error(error);
  }
};

module.exports = weather;
