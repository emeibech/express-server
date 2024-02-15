import express from 'express';
import dotenv from 'dotenv';
import index from './routes/index.js';
import { handleCors, handleRouteError } from './common/middleWares.js';
import cookieParser from 'cookie-parser';

dotenv.config();
const secret = process.env.COOKIE_SECRET ?? 'j38490n8y39#59F4rIU^$';
const port = process.env.PORT || 3001;
const app = express();

app.set('trust proxy', 1);
app.use(handleCors);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(handleRouteError);
app.use(cookieParser(secret));
app.use('/', index);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
