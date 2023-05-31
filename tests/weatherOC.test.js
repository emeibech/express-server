const needle = require('needle');
const weatherOC = require('../routes/weatherOC');

// Mock needle for testing purposes
jest.mock('needle');

describe('weatherOC unit test', () => {
  beforeEach(() => jest.clearAllMocks());

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
      statusCode: 404,
      statusMessage: 'Not Found',
    };

    needle.mockResolvedValue(mockResponse);

    const data = await weatherOC(mockRequest);
    // Data should be equal to mockResponse.body
    expect(data).toEqual({
      error: `${mockResponse.statusCode} ${mockResponse.statusMessage}`,
    });
  });

  it('logs the error caught in catch block', async () => {
    // Mock the error
    const mockError = { error: '408 Request Timeout' };
    // Set needle's rejected value to mockError
    needle.mockRejectedValue(mockError);

    console.error = jest.fn();

    await weatherOC(mockRequest);
    // console.error should execute with the mockError as parameter
    expect(console.error).toHaveBeenCalledWith(mockError);
  });
});
