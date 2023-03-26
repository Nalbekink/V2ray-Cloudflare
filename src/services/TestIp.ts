import axios, { CancelToken, AxiosError } from "axios";

async function testIp(ip: string, timeout: number = 2500, count: number = 5) {
  const url: string = `https://${ip}/`;
  const startTime = performance.now();
  let successfulRequests: number = 0;
  const delay_rate = 1.5;

  for (let i = 0; i < count; i++) {
    try {
      const source = axios.CancelToken.source();
      const response = await axios.get(url, {
        cancelToken: source.token,
        timeout: i == 0 ? 1.5 * delay_rate * timeout : delay_rate * timeout,
      });
    } catch (error: any) {
      if (error instanceof AxiosError && error.message.includes("Network")) {
        successfulRequests++;
      } else {
        return null;
      }
    }
  }

  const duration = (performance.now() - startTime) / delay_rate;

  if (successfulRequests === count) {
    return { ip: ip, time: Math.floor(duration / count) };
  } else {
    return null;
  }
}

export default testIp;
