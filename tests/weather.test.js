const weather = require('../routes/weather');
const needle = require('needle');
require('dotenv').config();

jest.mock('needle');

describe('weather unit test', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('makes GET requests with correct URLs and parameters', async () => {
    const mockResponse = {
      body: {
        coord: {
          lat: 14.6042,
          lon: 120.9822,
        },
      },
    };

    needle.mockResolvedValue(mockResponse);

    const mockReq = {
      headers: { host: 'localhost:3000' },
      url: '/api/weather?q=manila',
    };

    await weather(mockReq);

    expect(needle).toHaveBeenCalledTimes(2);
    expect(needle).toHaveBeenCalledWith(
      'get',
      expect.stringContaining(
        `${process.env.API_OW_WEATHER_URL}?${mockReq.url.slice(13)}&${
          process.env.API_OW_KEY_NAME
        }=${process.env.API_OW_KEY_VALUE}`
      )
    );
  });

  it.skip('returns the response data', async () => {
    const mockResponse = { body: { weatherData: 'Weather Data' } };
    needle.mockResolvedValue(mockResponse);

    const data = await weather();

    expect(data).toEqual(mockResponse.body);
  });

  it.skip('handles and logs errors', async () => {
    const mockError = { body: { error: 'An error occured' } };
    needle.mockRejectedValue(mockError);
    console.error = jest.fn();

    await weather();

    expect(console.error).toHaveBeenCalledWith(mockError);
  });
});
