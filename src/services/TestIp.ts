import axios, { CancelToken, AxiosError } from "axios";

async function testIp(ip: string, timeout: number = 2500, count: number = 5) {
  const url: string = `https://${ip}/`;
  let startTime: number = 0;
  let successfulRequests: number = 0;
  const delay_rate = 1.2;

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
    } catch (error: any) {
      if (error instanceof AxiosError && error.message.includes("Network")) {
        successfulRequests++;
      } else {
        return null;
      }
    }
  }

  const duration = (performance.now() - startTime) / delay_rate;

  if (successfulRequests === count + 1) {
    return { ip: ip, time: Math.floor(duration / count) };
  } else {
    return null;
  }
}

export default testIp;
