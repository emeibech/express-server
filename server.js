const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const port = process.env.PORT || 3001;
const app = express();

// Middleware
app.use(cors());

// Routes
app.use('/', require(path.join(__dirname, 'routes', 'index')));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
