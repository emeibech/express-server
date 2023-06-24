const needle = require('needle');
require('dotenv').config();

const oneCallUrl = process.env.API_OW_ONECALL_URL;
const keyName = process.env.API_OW_KEY_NAME;
const keyValue = process.env.API_OW_KEY_VALUE;

const weatherOC = async (req) => {
  try {
    const oneCallParams = new URL(req.url, `http://${req.headers.host}`)
      .searchParams;

    oneCallParams.append('exclude', 'minutely,alerts');
    oneCallParams.append(keyName, keyValue);

    const oneCallData = await needle('get', `${oneCallUrl}?${oneCallParams}`);

    if (oneCallData.body.cod !== 200) {
      return {
        error: `${oneCallData.body.cod} ${oneCallData.body.message}`,
      };
    }

    return {
      ...oneCallData.body,
      hourly: { pop: oneCallData.body.hourly[1].pop },
    };
  } catch (error) {
    console.error(error);
  }
};

module.exports = weatherOC;
