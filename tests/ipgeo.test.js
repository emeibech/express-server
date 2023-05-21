const ipgeo = require("../routes/ipgeo");
const needle = require("needle");
require("dotenv").config();

jest.mock("needle");

describe("ipgeo unit test", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("Makes a GET request with correct URL and parameters", async () => {
    const mockRes = {
      body: {
        weatherData: "Weather Data",
      },
    };

    needle.mockResolvedValue(mockRes);

    await ipgeo();

    expect(needle).toHaveBeenCalledTimes(1);
    expect(needle).toHaveBeenCalledWith(
      "get",
      expect.stringContaining(
        `${process.env.API_IPGEO_URL}?${process.env.API_IPGEO_KEY_NAME}=${process.env.API_IPGEO_KEY_VALUE}`
      )
    );
  });
});
