import axios, { CancelToken, AxiosError } from "axios";
import getCountryInfo from "./GetCountry";
async function testIp(ip: string, timeout: number = 2500, count: number = 5) {
  const url: string = `http://${ip}/cdn-cgi/trace?${Math.random()}`;
  let startTime: number = 0;
  let successfulRequests: number = 0;
  const delay_rate = 1.1;
  let countryInfo: Record<string, string> = {
    city: "?",
    country: "?",
    alphaCode2: "?",
    alphaCode3: "?",
  };

  for (let i = 0; i <= count; i++) {
    if (i == 1) {
      startTime = performance.now();
    }
    try {
      const source = axios.CancelToken.source();
      const response = await axios.get(url, {
        cancelToken: source.token,
        timeout: i == 0 ? 2 * delay_rate * timeout : delay_rate * timeout,
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

  const duration = (performance.now() - startTime) / delay_rate;

  if (successfulRequests === count + 1) {
    return { ip: ip, time: Math.floor(duration / count), region: countryInfo };
  } else {
    return null;
  }
}

export default testIp;
