const needle = require('needle');
require('dotenv').config();

const ipgeoURL = process.env.API_IPGEO_URL;
const keyName = process.env.API_IPGEO_KEY_NAME;
const keyValue = process.env.API_IPGEO_KEY_VALUE;

const ipgeo = async (req) => {
  try {
    const params = new URLSearchParams({
      [keyName]: keyValue,
      ip: req.header('X-Real-IP'),
    });

    const ipgeoData = await needle('get', `${ipgeoURL}?${params}`);

    if (ipgeoData.statusCode !== 200) return {
      error: `${ipgeoData.statusCode} ${ipgeoData.statusMessage}`,
    };

    const data = ipgeoData.body;

    return data;
  } catch (error) {
    console.error(error);
  }
};

module.exports = ipgeo;
