import axios, { CancelToken, AxiosError } from "axios";

async function testIp(ip: string, timeout: number = 2500, count: number = 5) {
  const url: string = `https://${ip}/`;
  const startTime = performance.now();
  let successfulRequests: number = 0;

  for (let i = 0; i < count; i++) {
    try {
      const source = axios.CancelToken.source();
      const response = await axios.get(url, {
        cancelToken: source.token,
        timeout: timeout,
      });
    } catch (error: any) {
      if (error instanceof AxiosError && error.message.includes("Network")) {
        successfulRequests++;
      } else {
        return null;
      }
    }
  }

  const duration = performance.now() - startTime;

  if (successfulRequests === count) {
    return { ip: ip, time: Math.floor(duration / count) };
  } else {
    return null;
  }
}

export default testIp;
