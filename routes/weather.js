const needle = require('needle');
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

    if (weatherData.statusCode !== 200) {
      return {
        error: `${weatherData.statusCode} ${weatherData.statusMessage}`,
      };
    }

    const { lat, lon } = weatherData.body.coord;

    const forecastParams = new URLSearchParams({
      [keyName]: keyValue,
      exclude: 'minutely',
      lat,
      lon,
    });

    const forecastData = await needle('get', `${oneCallUrl}?${forecastParams}`);

    if (forecastData.statusCode !== 200) {
      return {
        error: `${forecastData.statusCode} ${forecastData.statusMessage}`,
      };
    }

    const data = {
      ...forecastData.body,
      hourly: forecastData.body.hourly[1].pop,
    };

    return data;
  } catch (error) {
    console.error(error);
  }
};

module.exports = weather;
