import axios, { CancelToken, AxiosError } from "axios";
import getCountryInfo from "./GetCountry";

async function testIp(ip: string, timeout: number = 2500, count: number = 5) {
  const url: string = `http://${ip}/cdn-cgi/trace/`;
  const startTime = performance.now();
  let successfulRequests: number = 0;
  let countryInfo: Record<string, string> = {};

  for (let i = 0; i < count; i++) {
    try {
      const source = axios.CancelToken.source();
      const response = await axios.get(url, {
        cancelToken: source.token,
        timeout: timeout,
      });
      successfulRequests += 1;
      if (successfulRequests == 1) {
        countryInfo = getCountryInfo(
          response.data.split("\n")[6].split("=")[1]
        );
      }
    } catch (error: any) {
      return null;
    }
  }

  const duration = performance.now() - startTime;

  if (successfulRequests === count) {
    return { ip: ip, time: Math.floor(duration / count), region: countryInfo };
  } else {
    return null;
  }
}

export default testIp;
