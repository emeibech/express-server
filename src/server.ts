import express, { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import index from './routes/index.js';
import ipgeo from './routes/openweather/ipgeo.js';
import weather from './routes/openweather/weather.js';
import onecall from './routes/openweather/onecall.js';
import codeAnalyzer from './routes/openai/codeAnalyzer.js';
import codingAssistant from './routes/openai/codingAssistant.js';
import eli5 from './routes/openai/eli5.js';
import storyGenerator from './routes/openai/storyGenerator.js';
import toneChanger from './routes/openai/toneChanger.js';
import generalAssistant from './routes/openai/generalAssistant.js';
import bodyParser from 'body-parser';

dotenv.config();

const port = process.env.PORT || 3001;
const app = express();

app.set('trust proxy', 1);
app.use(bodyParser.json());
app.use('/', index);
app.use('/ipgeo', ipgeo);
app.use('/weather', weather);
app.use('/onecall', onecall);
app.use('/codeanalyzer', codeAnalyzer);
app.use('/codingassistant', codingAssistant);
app.use('/eli5', eli5);
app.use('/storygenerator', storyGenerator);
app.use('/tonechanger', toneChanger);
app.use('/generalassistant', generalAssistant);

app.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(err);
  }
  console.error(err);
  res.status(500);
  res.json({
    [err.name]: err.message,
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
