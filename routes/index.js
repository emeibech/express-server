const express = require('express');
const ipgeo = require('./ipgeo');
const weather = require('./weather');
const apiCache = require('apicache');
const router = express.Router();

// Initialize cache
let cache = apiCache.middleware;

router.get('/', (req, res) => {
  try {
    res.json({
      serverStatus: 'Active',
    });
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.get('/api/ip', cache('5 minutes'), (req, res) => {
  try {
    res.json({ ip: req.header('X-Real-IP') });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'An error occurred while fetching geolocation data',
    });
  }
});

router.get('/api/ipgeo', cache('5 minutes'), async (req, res) => {
  try {
    const data = await ipgeo(req);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'An error occurred while fetching geolocation data',
    });
  }
});

router.get('/api/weather', cache('5 minutes'), async (req, res) => {
  try {
    const weatherData = await weather(req);
    res.json(weatherData);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'An error occurred while fetching weather data',
    });
  }
});

module.exports = router;
