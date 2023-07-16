import { describe, beforeEach, it, expect, vi } from 'vitest';
import needle from 'needle';
import weather from '../routes/openweather/weather.js'
import dotenv from 'dotenv';

dotenv.config();
vi.mock('needle');
describe('weather unit test', () => {
  beforeEach(() => vi.resetAllMocks());

  const mockRequest = {
    headers: { host: 'localhost:3000' },
    url: '/weather?q=manila',
  };

  it('returns the response data on status 200', async () => {
    const mockResponse = {
      statusCode: 200,
      body: {
        coord: { lat: 14.6042, lon: 120.9822},
        hourly: [ 0, { pop: 1 } ],
        sys: { country: 'PH' },
      },
    };

    needle.mockResolvedValue(mockResponse);

    const data = await weather(mockRequest);

    expect(data).toEqual({
      ...mockResponse.body,
      hourly: { pop: mockResponse.body.hourly[1].pop},
      sys: { country: mockResponse.body.sys.country },
    });
  });

  it('returns the error code and message on failed request', async () => {
    const mockResponse = {
      body: {
        cod: 404,
        message: 'Not Found',
      }
    };

    needle.mockResolvedValue(mockResponse);

    const data = await weather(mockRequest);

    expect(data).toEqual({
      error: `${mockResponse.body.cod}: ${mockResponse.body.message}`,
    });
  });

  it('logs the error caught on catch block', async () => {
    const mockError = { body: { error: 'An error occurred' } };
    needle.mockRejectedValue(mockError);
    console.error = vi.fn();

    await weather(mockRequest);

    expect(console.error).toHaveBeenCalledWith(mockError);
  });
});
