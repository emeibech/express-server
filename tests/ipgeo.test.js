const ipgeo = require('../routes/ipgeo');
const needle = require('needle');
require('dotenv').config();

jest.mock('needle');

describe('ipgeo unit test', () => {
  beforeEach(() => jest.clearAllMocks());

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
      error: `${mockResponse.statusCode} ${mockResponse.statusMessage}`
    });
  });

  it('logs the errors caught in catch block', async () => {
    const mockError = { body: { error: 'An error occured' } };
    needle.mockRejectedValue(mockError);
    console.error = jest.fn();

    await ipgeo(mockReq);

    expect(console.error).toHaveBeenCalledWith(mockError);
  });
});
