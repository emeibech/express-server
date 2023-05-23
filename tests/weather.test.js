const weather = require('../routes/weather');
const needle = require('needle');
require('dotenv').config();

jest.mock('needle');

describe('weather unit test', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('makes GET requests with correct URL and parameters', async () => {
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

    // Assert the first needle call for weatherData
    expect(needle).toHaveBeenCalledWith(
      'get',
      expect.stringMatching(
        new RegExp(
          `^${process.env.API_OW_WEATHER_URL}\\?${mockReq.url.slice(13)}&${
            process.env.API_OW_KEY_NAME
          }=${process.env.API_OW_KEY_VALUE}$`
        )
      )
    );

    // Assert the second needle call for forecastData
    expect(needle).toHaveBeenCalledWith(
      'get',
      expect.stringContaining(
        `${process.env.API_OW_ONECALL_URL}?${process.env.API_OW_KEY_NAME}=${process.env.API_OW_KEY_VALUE}`
      )
    );
  });

  it('returns the response data', async () => {
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

    const data = await weather(mockReq);

    expect(data).toEqual({
      forecastData: mockResponse.body,
      weatherData: mockResponse.body,
    });
  });

  it('handles and logs errors', async () => {
    const mockError = { body: { error: 'An error occurred' } };
    needle.mockRejectedValue(mockError);
    console.error = jest.fn();

    const mockReq = {
      headers: { host: 'localhost:3000' },
      url: '/api/weather?q=manila',
    };

    await weather(mockReq);

    expect(console.error).toHaveBeenCalledWith(mockError);
  });
});
