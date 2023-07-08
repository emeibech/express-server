import express from 'express';
import dotenv from 'dotenv';
import index from './routes/index.js';

dotenv.config();

const port = process.env.PORT || 3001;
const app = express();

app.set('trust proxy', 1);
app.use('/', index);

// Error handling middleware
app.use((err, req, res) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
