import express, { type Request, type Response } from 'express';
import dotenv from 'dotenv';
import index from './routes/index.js';
import bodyParser from 'body-parser';

dotenv.config();

const port = process.env.PORT || 3001;
const app = express();

app.set('trust proxy', 1);
app.use(bodyParser.json());
app.use('/', index);

app.use((err: Error, _req: Request, res: Response) => {
  console.error(err);
  res.status(500).json({
    [err.name]: err.message,
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
