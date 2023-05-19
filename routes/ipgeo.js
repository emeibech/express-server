const needle = require('needle');
require('dotenv').config();

const ipgeoURL = process.env.API_IPGEO_URL;
const keyName = process.env.API_IPGEO_KEY_NAME;
const keyValue = process.env.API_IPGEO_KEY_VALUE;

const ipgeo = async () => {
  try {
    const params = new URLSearchParams({
      [keyName]: keyValue
    });

    const apiRes = await needle('get',`${ipgeoURL}?${params}`);
    const data = apiRes.body;

    // console.log({
    //   coutryCode: data.country_code2,
    //   lat: data.latitude,
    //   long: data.longitude,
    // })

    return data;
  } catch (error) {
    console.error(error);
  }
}

module.exports = ipgeo;
