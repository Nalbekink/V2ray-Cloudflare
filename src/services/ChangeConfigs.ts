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

  var max = 10 * count

  let newConfigs: string = "";
  while (count > 0 && max > 0) {
    let currentConfig: Record<any, any> = {...configs[Math.floor(Math.random() * configs.length)]};
    let protocol_type: string = currentConfig.protocol.toLowerCase();
    delete currentConfig.protocol;

    if ( https_ports.includes(parseInt(currentConfig.port)) && (currentConfig.host || currentConfig.sni)) {
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
          const confStr: string = "vmess://" + btoa(JSON.stringify(conf));
          newConfigs = newConfigs + confStr + "\n";
          count--;
        } catch (ee) {
          console.log("Error Changing VMESS configs");
        }
      } else if ((protocol_type == "vless" || protocol_type == "trojan") && (currentConfig.type == "ws" || currentConfig.type == "grpc")) {
        try {
          let conf: Record<any, any> = { ...currentConfig };

          let port = conf.port
          delete conf.port
          delete conf.address

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
            cleanIPs[Math.floor(Math.random() * cleanIPs.length)].ip +
            ":" +
            port +
            "?" +
            serializeQuery(conf) +
            "#" +
            "Nalbekink" +
            "-" +
            protocol_type +
            "-" +
            conf.fp + (conf.alpn != "" ? "-" + conf.alpn : "");

          newConfigs = newConfigs + confStr + "\n";
          count--;
        } catch (ee) {
          console.log("Error Changing VLESS/Trojan configs");
        }
      } else {
        console.log('Config Settings Invalid for Changing...')
        console.log(currentConfig)
        max--;
      }
    } else {
      console.log('Config is either not on https ports or its type is not ws/grpc')
      console.log(currentConfig)
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

export default changeConfigs;
