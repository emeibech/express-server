const express = require('express');
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

module.exports = router;
