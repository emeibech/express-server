const express = require('express');
const needle = require('needle');
const router = express.Router();

const ipgeoURL = process.env.API_IPGEO_URL;
const keyName = process.env.API_IPGEO_KEY_NAME;
const keyValue = process.env.API_IPGEO_KEY_VALUE;

router.get('/ip', async (req, res) => {
  try {
    const params = new URLSearchParams({
      [keyName]: keyValue
    });

    const apiRes = await needle('get',`${ipgeoURL}?${params}`);
    const data = apiRes.body;

    res.json(data);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "An error occurred while fetching geolocation data",
    });
  }
})

module.exports = router;
