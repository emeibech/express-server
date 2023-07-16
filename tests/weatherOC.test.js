import { describe, beforeEach, it, expect, vi } from 'vitest';
import needle from 'needle';
import weatherOC from '../routes/openweather/weatherOC.js'
import dotenv from 'dotenv';

dotenv.config();
vi.mock('needle');

describe('weatherOC unit test', () => {
  beforeEach(() => vi.clearAllMocks());

  // Mock the neccessary parameters for the request
  const mockRequest = {
    headers: { host: 'localhost:3000' },
    url: 'onecall?lat=35.6895&lon=139.6917',
  };

  it('returns the response data on status 200', async () => {
    // Status is 200 to mock successful request
    const mockResponse = {
      statusCode: 200,
      body: { 
        forecast: 'Forecast Data',
        hourly: [ 0, { pop: '1'} ],
      },
    };
    // Mock needle's resolved value with mockResponse
    needle.mockResolvedValue(mockResponse);

    const data = await weatherOC(mockRequest);
    // Data should be equal to mockResponse.body
    expect(data).toEqual({
      ...mockResponse.body,
      hourly: { pop: mockResponse.body.hourly[1].pop }
    });
  });

  it('returns the error code and message on failed request', async () => {
    // Status is 404 to mock failed request
    const mockResponse = {
      body: {
        cod: 404,
        message: 'Not Found',
      }
    };

    needle.mockResolvedValue(mockResponse);

    const data = await weatherOC(mockRequest);
    // Data should be equal to mockResponse.body
    expect(data).toEqual({
      error: `${mockResponse.body.cod}: ${mockResponse.body.message}`,
    });
  });

  it('logs the error caught in catch block', async () => {
    // Mock the error
    const mockError = { error: '408 Request Timeout' };
    // Set needle's rejected value to mockError
    needle.mockRejectedValue(mockError);

    console.error = vi.fn();

    await weatherOC(mockRequest);
    // console.error should execute with the mockError as parameter
    expect(console.error).toHaveBeenCalledWith(mockError);
  });
});
