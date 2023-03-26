const https_ports = [443, , 2053, 2083, 2087, 2096, 8443];

function changeConfigs(
  configs: Record<any, any>[],
  cleanIPs: { ip: string; time: number }[],
  count: number,
  alpns: string[],
  useragents: string[]
) {
  if (alpns.length == 0) {
    alpns.push("");
  }

  if (useragents.length == 0) {
    useragents.push("");
  }

  var max = 10 * count;

  const weights: number[] = softmin(cleanIPs.map((a) => a.time / 500));
  const ips: string[] = cleanIPs.map((a) => a.ip);
  const total_count = count;
  let newConfigs: string = "";
  while (count > 0 && max > 0) {
    let currentConfig: Record<any, any> = {
      ...configs[Math.floor(Math.random() * configs.length)],
    };
    let protocol_type: string = currentConfig.protocol.toLowerCase();
    delete currentConfig.protocol;

    if (
      https_ports.includes(parseInt(currentConfig.port)) &&
      (currentConfig.host || currentConfig.sni)
    ) {
      let host = currentConfig.host || currentConfig.sni;
      if (
        protocol_type == "vmess" &&
        (currentConfig.net == "ws" || currentConfig.net == "grpc")
      ) {
        try {
          let conf: Record<any, any> = { ...currentConfig };
          conf.host = host;
          conf.sni = host;
          conf.tls = "tls";
          conf.add = sampleFromDistribution(ips, weights);
          conf.fp = useragents[Math.floor(Math.random() * useragents.length)];
          conf.alpn = alpns[Math.floor(Math.random() * alpns.length)];
          conf.ps =
            `${total_count - count + 1}-` +
            "Nalbekink" +
            "-" +
            "vmess" +
            "-" +
            conf.net +
            "-" +
            conf.fp +
            (conf.alpn != "" ? "-" + conf.alpn : "");
          const confStr: string = "vmess://" + btoa(JSON.stringify(conf));
          newConfigs = newConfigs + confStr + "\n";
          count--;
        } catch (ee) {
          console.log("Error Changing VMESS configs");
        }
      } else if (
        (protocol_type == "vless" || protocol_type == "trojan") &&
        (currentConfig.type == "ws" || currentConfig.type == "grpc")
      ) {
        try {
          let conf: Record<any, any> = { ...currentConfig };

          let port = conf.port;
          delete conf.port;
          delete conf.address;

          conf.sni = host;
          conf.host = host;
          conf.tls = "tls";
          conf.fp = useragents[Math.floor(Math.random() * useragents.length)];
          conf.alpn = alpns[Math.floor(Math.random() * alpns.length)];

          const confStr: string =
            protocol_type +
            "://" +
            (conf.uuid || conf.password) +
            "@" +
            sampleFromDistribution(ips, weights) +
            ":" +
            port +
            "?" +
            serializeQuery(conf) +
            "#" +
            `${total_count - count + 1}-` +
            "Nalbekink" +
            "-" +
            protocol_type +
            "-" +
            conf.type +
            "-" +
            conf.fp +
            (conf.alpn != "" ? "-" + conf.alpn : "");

          newConfigs = newConfigs + confStr + "\n";
          count--;
        } catch (ee) {
          console.log("Error Changing VLESS/Trojan configs");
        }
      } else {
        console.log("Config Settings Invalid for Changing...");
        console.log(currentConfig);
        max--;
      }
    } else {
      console.log(
        "Config is either not on https ports or its type is not ws/grpc"
      );
      console.log(currentConfig);
      max--;
    }
  }

  return newConfigs;
}

function serializeQuery(obj: Record<any, any> | any) {
  var str = [];
  for (var p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  return str.join("&");
}

function softmin(values: number[]): number[] {
  const min = Math.max(...values);
  const softmaxed = values.map((v) => Math.exp(min - v));
  const sum = softmaxed.reduce((acc, cur) => acc + cur, 0);
  return softmaxed.map((v) => v / sum);
}

function sampleFromDistribution<T>(list: T[], weights: number[]): T {
  const sum = weights.reduce((acc, cur) => acc + cur, 0);
  const probabilities = weights.map((w) => w / sum);

  let cumulativeProbability = 0;
  const randomValue = Math.random();
  for (let i = 0; i < probabilities.length; i++) {
    cumulativeProbability += probabilities[i];
    if (randomValue <= cumulativeProbability) {
      return list[i];
    }
  }

  // This line should never be reached, but just in case...
  return list[0];
}

export default changeConfigs;
