const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const apiCache = require('apicache');
const ipgeo = require('./ipgeo');
const weather = require('./weather');
const weatherOC = require('./weatherOC');

const router = express.Router();

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

const whitelist = ['https://weatheremeibech.netlify.app'];
const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit exceeded. Try again in an hour.' },
});

router.use(cors(corsOptions));
router.use(limiter);

const cache = apiCache.middleware;

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
