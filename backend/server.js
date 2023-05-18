import express from 'express';
import dotenv from 'dotenv';

dotenv.config();
const port = process.env.PORT || 3001;

const app = express();

app.get('/', (req, res) => res.send('Server Running...'));

app.listen(port, () => console.log(`Server started on port ${port}`));