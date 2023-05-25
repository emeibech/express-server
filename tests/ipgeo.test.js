const ipgeo = require('../routes/ipgeo');
const needle = require('needle');
require('dotenv').config();

jest.mock('needle');

describe('ipgeo unit test', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('makes a GET request with correct URL and parameters', async () => {
    const mockResponse = { body: { ipData: 'IP Address Data' } };
    needle.mockResolvedValue(mockResponse);

    const mockReq = {
      header: (param) => param === 'X-Real-IP' ? 'realIP' : undefined,
    }

    await ipgeo(mockReq);

    expect(needle).toHaveBeenCalledTimes(1);
    expect(needle).toHaveBeenCalledWith(
      'get',
      expect.stringContaining(
        `${process.env.API_IPGEO_URL}?${process.env.API_IPGEO_KEY_NAME}=${process.env.API_IPGEO_KEY_VALUE}`
      )
    );
  });

  it('returns the response data', async () => {
    const mockResponse = { body: { ipData: 'IP Address Data' } };
    needle.mockResolvedValue(mockResponse);

    const mockReq = {
      header: (param) => (param === 'X-Real-IP') ? 'realIP' : undefined,
    }

    const data = await ipgeo(mockReq);

    expect(data).toEqual(mockResponse.body);
  });

  it('handles and logs errors', async () => {
    const mockError = { body: { error: 'An error occured' } };
    needle.mockRejectedValue(mockError);
    console.error = jest.fn();

    const mockReq = {
      header: (param) => param === 'X-Real-IP' ? 'realIP' : undefined,
    }

    await ipgeo(mockReq);

    expect(console.error).toHaveBeenCalledWith(mockError);
  });
});
