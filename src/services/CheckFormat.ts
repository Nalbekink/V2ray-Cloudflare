function isBase64(str: string): boolean {
  try {
    // Decode the string using atob()
    const decodedString = atob(str);

    // Check if the decoded string can be re-encoded as a valid base64 string
    const reEncodedString = btoa(decodedString);
    return reEncodedString === str;
  } catch (error) {
    // If decoding the string using atob() fails, return false
    return false;
  }
}

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

function extractConfigs(text: string): Record<string, any>[] {
  const vmessRegex = /vmess:\/\/([\w+/-]+={0,2})/g;
  const vlessRegex =
    /vless:\/\/(\S+)@(\w+.\w+.\w+.\w+):(\d+)\?((\S+=\S+)&?)+#(\S+)/g;
  const trojanRegex =
    /trojan:\/\/(\S+)@(\w+.\w+.\w+.\w+):(\d+)\?((\S+=\S+)&?)+#(\S+)/g;

  const vmessMatches = text.matchAll(vmessRegex) ?? [];
  const vlessMatches = text.matchAll(vlessRegex) ?? [];
  const trojanMatches = text.matchAll(trojanRegex) ?? [];

  const vmessConfigs: Record<string, any>[] = [];
  const vlessConfigs: Record<string, any>[] = [];
  const trojanConfigs: Record<string, any>[] = [];

  for (const match of vmessMatches) {
    try {
      const configString = atob(match[1]);
      const config: configType = JSON.parse(configString);
      config["protocol"] = "vmess";
      config["tls"] = "tls";
      vmessConfigs.push(config);
    } catch (error: any) {
      console.error(`Error parsing VMESS config: ${error.message}`);
    }
  }

  for (const match of vlessMatches) {
    try {
      const config: Record<any, any> = {
        protocol: "vless",
        address: match[2],
        port: parseInt(match[3]),
        uuid: match[1],
        tls: "tls",
        name: match[6],
      };

      match[4].split("&").forEach((param: string) => {
        const [key, value] = param.split("=");
        config[key] = decodeURIComponent(value);
      });
      vlessConfigs.push(config);
    } catch (error: any) {
      console.error(`Error parsing VLESS config: ${error.message}`);
    }
  }

  for (const match of trojanMatches) {
    try {
      const config: Record<any, any> = {
        protocol: "trojan",
        address: match[2],
        port: parseInt(match[3]),
        password: match[1],
        tls: "tls",
        name: match[6],
      };

      match[4].split("&").forEach((param) => {
        const [key, value] = param.split("=");
        config[key] = decodeURIComponent(value);
      });
      config["tls"] = "tls";
      trojanConfigs.push(config);
    } catch (error: any) {
      console.error(`Error parsing Trojan config: ${error.message}`);
    }
  }

  return [vmessConfigs, vlessConfigs, trojanConfigs];
}

export default extractConfigs;
