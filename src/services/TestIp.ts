async function testIp(ip: string, timeout: number = 2500, count: number = 5) {
  var testResult: number = 0;
  const url: string = `https://${ip}/__down`;
  const startTime = performance.now();
  const controller = new AbortController();

  for (let i = 0; i < count; i++) {
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
      });

      testResult++;
    } catch (error: any) {
      if (error.name === "AbortError") {
        //
      } else {
        testResult++;
      }
    }
    clearTimeout(timeoutId);
  }

  const duration = performance.now() - startTime;
  if (testResult === count) {
    return { ip: ip, time: Math.floor(duration / count) };
  } else {
    return null;
  }
}

export default testIp;
