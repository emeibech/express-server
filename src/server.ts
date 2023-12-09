import express from 'express';
import dotenv from 'dotenv';
import index from './routes/index.js';
import { handleRouteError } from './common/middleWares.js';

dotenv.config();

const port = process.env.PORT || 3001;
const app = express();

app.set('trust proxy', 1);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/', index);
app.use(handleRouteError);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
