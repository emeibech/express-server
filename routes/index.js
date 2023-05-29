const express = require('express');
const apiCache = require('apicache');
const ipgeo = require('./ipgeo');
const weather = require('./weather');
const weatherOC = require('./weatherOC');

const router = express.Router();

// Initialize cache
const cache = apiCache.middleware;

router.get('/', (req, res) => {
  try {
    res.json({
      serverStatus: 'Active',
      yourIP: req.header('X-Real-IP'),
    });
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.get('/ipgeo', cache('5 minutes'), async (req, res) => {
  try {
    const data = await ipgeo(req);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: '500: An error occurred while fetching geolocation data',
    });
  }
});

router.get('/weather', cache('5 minutes'), async (req, res) => {
  try {
    const weatherData = await weather(req);
    res.json(weatherData);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: '500: An error occurred while fetching weather data',
    });
  }
});

router.get('/onecall', cache('5 minutes'), async (req, res) => {
  try {
    const weatherData = await weatherOC(req);
    res.json(weatherData);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: '500: An error occurred while fetching weather data',
    });
  }
});

module.exports = router;
