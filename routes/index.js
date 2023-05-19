const express = require('express');
const ipgeo = require('./ipgeo');
const weather = require('./weather');
const router = express.Router();

router.get('/', (req, res) => {
  try {
    res.json({
      serverStatus: "Active",
    });
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.get('/api/ip', async (req, res) => {
  try {
    const data = await ipgeo();

    res.json(data);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "An error occurred while fetching geolocation data",
    });
  }
});

router.get('/api/weather', async (req, res) => {
  try {
    const weatherData = await weather(req);
    res.json(weatherData);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "An error occurred while fetching weather data",
    });
  }
})

module.exports = router;
