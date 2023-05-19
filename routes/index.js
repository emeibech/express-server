const express = require('express');
const ipgeo = require('./ipgeo');
const router = express.Router();

router.get('/', (req, res) => {
  try {
    res.json({
      serverStatus: "Active",
    });
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.get('/api/ip', ipgeo);

module.exports = router;
