const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const index = require('./routes/index');
require('dotenv').config();

const port = process.env.PORT || 3001;
const app = express();

// Rate limit
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit exceeded. Try again in an hour.' },
});

app.set('trust proxy', 1);
app.use(cors());
app.use(limiter);
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
