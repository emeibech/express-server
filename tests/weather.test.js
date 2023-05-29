const needle = require('needle');
const weather = require('../routes/weather');
require('dotenv').config();

jest.mock('needle');

describe('weather unit test', () => {
  beforeEach(() => jest.resetAllMocks());

  const mockRequest = {
    headers: { host: 'localhost:3000' },
    url: '/weather?q=manila',
  };

  it('returns the response data on status 200', async () => {
    const mockResponse = {
      statusCode: 200,
      body: {
        coord: {
          lat: 14.6042,
          lon: 120.9822,
        },
      },
    };

    needle.mockResolvedValue(mockResponse);

    const data = await weather(mockRequest);

    expect(data).toEqual({
      forecastData: mockResponse.body,
      weatherData: mockResponse.body,
    });
  });

  it('returns the error code and message on failed request', async () => {
    const mockResponse = {
      statusCode: 404,
      statusMessage: 'Not Found',
    };

    needle.mockResolvedValue(mockResponse);

    const data = await weather(mockRequest);

    expect(data).toEqual({
      error: `${mockResponse.statusCode} ${mockResponse.statusMessage}`,
    });
  });

  it('logs the error caught on catch block', async () => {
    const mockError = { body: { error: 'An error occurred' } };
    needle.mockRejectedValue(mockError);
    console.error = jest.fn();

    await weather(mockRequest);

    expect(console.error).toHaveBeenCalledWith(mockError);
  });
});
