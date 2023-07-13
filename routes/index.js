import { Router } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import apicache from 'apicache';
import ipgeo from './openweather/ipgeo.js';
import weather from './openweather/weather.js';
import weatherOC from './openweather/weatherOC.js';
import toneChanger from './openai/toneChanger.js';
import codeAnalyzer from './openai/codeAnalyzer.js';
import codingAssistant from './openai/codingAssistant.js';
import loreGenerator from './openai/loreGenerator.js';
import eli5 from './openai/eli5.js';
import generalAssistant from './openai/generalAssistant.js';

const router = Router();
const { middleware } = apicache;

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

// const whitelist = ['https://weatheremeibech.netlify.app'];
// const corsOptions = {
//   origin: (origin, callback) => {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
// };

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit exceeded. Try again in an hour.' },
});

router.use(cors());
// router.use(cors(corsOptions));
router.use(limiter);

const cache = middleware;

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

router.get('/tonechanger', async (req, res) => {
  try {
    const completionData = await toneChanger(req);
    res.json(completionData);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: '500: An error occurred while fetching openai data',
    });
  }
});

router.get('/codeanalyzer', async (req, res) => {
  try {
    const completionData = await codeAnalyzer(req);
    res.json(completionData);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: '500: An error occurred while fetching openai data',
    });
  }
});

router.get('/codingassistant', async (req, res) => {
  try {
    const completionData = await codingAssistant(req);
    res.json(completionData);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: '500: An error occurred while fetching openai data',
    });
  }
});

router.get('/loregenerator', async (req, res) => {
  try {
    const completionData = await loreGenerator(req);
    res.json(completionData);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: '500: An error occurred while fetching openai data',
    });
  }
});

router.get('/eli5', async (req, res) => {
  try {
    const completionData = await eli5(req);
    res.json(completionData);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: '500: An error occurred while fetching openai data',
    });
  }
});

router.get('/generalassistant', async (req, res) => {
  try {
    const completionData = await generalAssistant(req);
    res.json(completionData);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: '500: An error occurred while fetching openai data',
    });
  }
});

export default router;
