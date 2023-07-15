import { describe, beforeEach, it, expect, vi } from 'vitest';
import needle from 'needle';
import ipgeo from '../routes/openweather/ipgeo.js'
import dotenv from 'dotenv';

dotenv.config();
vi.mock('needle');

describe('ipgeo unit test', () => {
  beforeEach(() => vi.clearAllMocks());

  const mockReq = {
    header: () => 'Implementation does not matter',
  };

  it('returns the response data on status 200', async () => {
    const mockResponse = {
      statusCode: 200,
      body: { ipData: 'IP Address Data' },
    };

    needle.mockResolvedValue(mockResponse);

    const data = await ipgeo(mockReq);

    expect(data).toEqual(mockResponse.body);
  });

  it('returns the error code and message on failed request', async () => {
    const mockResponse = {
      statusCode: 404,
      statusMessage: 'Not found',
    };

    needle.mockResolvedValue(mockResponse);

    const data = await ipgeo(mockReq);

    expect(data).toEqual({
      error: `${mockResponse.statusCode}: ${mockResponse.statusMessage}`,
    });
  });

  it('logs the errors caught in catch block', async () => {
    const mockError = { body: { error: 'An error occured' } };
    needle.mockRejectedValue(mockError);
    console.error = vi.fn();

    await ipgeo(mockReq);

    expect(console.error).toHaveBeenCalledWith(mockError);
  });
});
