const useragents = [
  "chrome",
  "firefox",
  "safari",
  "random",
  "randomized",
  "ios",
  "android",
  "edge",
];

const https_ports = [443, 443, 2053, 2083, 2087, 2096, 8443];

interface configType {
  tls?: string;
  security?: string;
  alpn?: string;
  address?: string;
  uuid?: string;
  password?: string;
  aid?: string | number;
  port: string;
  host?: string;
  fp?: string;
  ps?: string;
  path?: string;
  name?: string;
  protocol: string;
  v?: string | number;
  add?: string;
  flow?: string;
  sni?: string;
  net?: string;
}

function changeConfigs(
  configs: configType[],
  cleanIPs: { ip: string; time: number }[],
  count: number,
  alpns: string[]
) {
  if (alpns.length == 0) {
    alpns.push("");
  }

  let newConfigs: string = "";
  while (count > 0) {
    let currentConfig: configType =
      configs[Math.floor(Math.random() * configs.length)];
    let protocol_type: string = currentConfig.protocol;
    if (
      https_ports.includes(parseInt(currentConfig.port)) &&
      currentConfig.tls &&
      currentConfig.tls == "tls" &&
      (currentConfig.host || currentConfig.sni)
    ) {
      let host = currentConfig.host || currentConfig.sni;
      console.log(host);
      if (
        protocol_type == "vmess" &&
        (currentConfig.net == "ws" || currentConfig.net == "grpc")
      ) {
        try {
          var conf: configType = { ...currentConfig };
          conf.aid = 0;
          conf.host = host;
          conf.sni = host;
          conf.tls = "tls";
          conf.add = cleanIPs[Math.floor(Math.random() * cleanIPs.length)].ip;
          conf.fp = useragents[Math.floor(Math.random() * useragents.length)];
          conf.alpn = alpns[Math.floor(Math.random() * alpns.length)];
          conf.ps =
            "Nalbekink" +
            "-" +
            "vmess" +
            "-" +
            conf.fp +
            (conf.alpn != "" ? "-" + conf.alpn : "");
          console.log(conf);
          const confStr: string = "vmess://" + btoa(JSON.stringify(conf));
          newConfigs = newConfigs + confStr + "\n";
          count--;
        } catch (ee) {
          console.log("Error Changing VMESS configs");
        }
      } else if (protocol_type == "vless" || protocol_type == "trojan") {
        try {
          var conf = { ...currentConfig };

          conf.address =
            cleanIPs[Math.floor(Math.random() * cleanIPs.length)].ip;
          var qs: configType = { port: conf.port, protocol: protocol_type };

          qs.sni = host;
          qs.host = host;
          qs.security = "tls";
          qs.tls = "tls";
          qs.fp = useragents[Math.floor(Math.random() * useragents.length)];
          qs.alpn = alpns[Math.floor(Math.random() * alpns.length)];
          qs.flow = conf.flow ? conf.flow : "";
          qs.path = conf.path;

          conf.name =
            "Nalbekink" +
            "-" +
            protocol_type +
            "-" +
            qs.fp +
            (qs.alpn != "" ? "-" + qs.alpn : "");

          const confStr: string =
            conf.protocol +
            "://" +
            (conf.uuid || conf.password) +
            "@" +
            conf.address +
            ":" +
            conf.port +
            "?" +
            serializeQuery(qs) +
            "#" +
            conf.name;

          newConfigs = newConfigs + confStr + "\n";
          count--;
        } catch (ee) {
          console.log("Error Changing VLESS/Trojan configs");
        }
      }
    } else {
      continue;
    }
  }

  console.log(newConfigs);
  return newConfigs;
}

function serializeQuery(obj: configType | any) {
  var str = [];
  for (var p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  return str.join("&");
}

export default changeConfigs;
