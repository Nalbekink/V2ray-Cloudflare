function getWorkerCode(cleanIps: { ip: string; time: number }[]): string {
  if (cleanIps.length == 0) {
    return "// No IP Found Yet";
  }
  const weights: number[] = softmin(cleanIps.map((a) => a.time / 500));
  const ips: string[] = cleanIps.map((a) => a.ip);
  const weightedCleanIPs = sampleMultipleFromDistribution(
    ips,
    weights,
    100
  ).map((a) => `'${a}'`);
  const allowedIpsStr: string = weightedCleanIPs.join(",\n\t\t");
  return `// Version 1.0.3

const maxConfigItems = 500
const maxPerType = 200
const includeOriginalConfigs = false

const subLinks = [
    "https://raw.githubusercontent.com/freefq/free/master/v2",
    "https://raw.githubusercontent.com/Pawdroid/Free-servers/main/sub",
    "https://raw.githubusercontent.com/aiboboxx/v2rayfree/main/v2",
    "https://raw.githubusercontent.com/AzadNetCH/Clash/main/V2Ray.txt"
]
const cnfLinks = [
    "https://raw.githubusercontent.com/mahdibland/ShadowsocksAggregator/master/sub/sub_merge.txt",
    "https://raw.githubusercontent.com/awesome-vpn/awesome-vpn/master/all"
]

const addressList = ["discord.com", "cloudflare.com", "nginx.com", "cdnjs.com", "vimeo.com", "networksolutions.com", "spotify.com"]
const fpList = ["chrome", "chrome", "chrome", "firefox", "safari", "edge", "ios", "android", "random", "random"]
const alpnList = ["http/1.1", "h2,http/1.1", "h2,http/1.1"]
var cleanIPs = [${allowedIpsStr}]

export default {
    async fetch(request) {
    var url = new URL(request.url)
    var pathParts = url.pathname.replace(/^\\/|\\/$/g, "").split("/")
    var type = pathParts[0].toLowerCase()
    if (["sub", "clash"].includes(type)) {

        var configList = []
        for (var subLink of subLinks) {
        try {
            configList = configList.concat(await fetch(subLink).then(r => r.text()).then(a => atob(a)).then(t => t.split("\\n")))
        } catch (e) { }
        }
        for (var cnfLink of cnfLinks) {
        try {
            configList = configList.concat(await fetch(cnfLink).then(r => r.text()).then(t => t.split("\\n")))
        } catch (e) { }
        }
        
        var vmessConfigList = configList.filter(cnf => (cnf.search("vmess://") == 0))
        var trojanConfigList = configList.filter(cnf => (cnf.search("trojan://") == 0))
        var ssConfigList = configList.filter(cnf => (cnf.search("ss://") == 0))
        var mergedConfigList = []
        
        if (type == "sub") {
        if (includeOriginalConfigs) {
            mergedConfigList = mergedConfigList.concat(getMultipleRandomElements(vmessConfigList, maxPerType))
        }
        mergedConfigList = mergedConfigList.concat(
            getMultipleRandomElements(
            vmessConfigList.map(decodeVmess).map(cnf => mixConfig(cnf, url, "vmess")).filter(cnf => (!!cnf && cnf.id)).map(encodeVmess).filter(cnf => !!cnf),
            maxPerType
            )
        )

        if (includeOriginalConfigs) {
            mergedConfigList = mergedConfigList.concat(getMultipleRandomElements(trojanConfigList, maxPerType))
            mergedConfigList = mergedConfigList.concat(getMultipleRandomElements(ssConfigList, maxPerType))
        }

        return new Response(btoa(getMultipleRandomElements(mergedConfigList, maxConfigItems).join("\\n")));
        } else { // clash
        if (includeOriginalConfigs) {
            mergedConfigList = mergedConfigList.concat(
            getMultipleRandomElements(
                vmessConfigList.map(decodeVmess).filter(cnf => (cnf && cnf.id)).map(cnf => toClash(cnf, "vmess")).filter(cnf => (cnf && cnf.uuid)),
                maxPerType
            )
            )
        }
        mergedConfigList = mergedConfigList.concat(
            getMultipleRandomElements(
            vmessConfigList.map(decodeVmess).map(cnf => mixConfig(cnf, url, "vmess")).filter(cnf => (cnf && cnf.id)).map(cnf => toClash(cnf, "vmess")),
            maxPerType
            )
        )
        return new Response(toYaml(mergedConfigList));
        }
    } else {
        var url = new URL(request.url)
        var newUrl = new URL("https://" + url.pathname.replace(/^\/|\/$/g, ""))
        return fetch(new Request(newUrl, request));
    }
    }
}

function encodeVmess(conf) {
    try {
    return "vmess://" + btoa(JSON.stringify(conf))
    } catch {
    return null
    }
}

function decodeVmess(conf) {
    try {
    return JSON.parse(atob(conf.substr(8)))
    } catch {
    return {}
    }
}

function mixConfig(conf, url, protocol) {
    try {
    if (conf.tls != "tls") {
        return {}
    }
    var addr = conf.sni
    if (!addr) {
        if (conf.add && !isIp(conf.add)) {
        addr = conf.add
        } else if (conf.host && !isIp(conf.host)) {
        addr = conf.host
        }
    }
    if (!addr) {
        return conf
    }
    conf.name = (conf.name ? conf.name : conf.ps) + '-Worker'
    conf.sni = url.hostname
    if (cleanIPs.length) {
        conf.add = cleanIPs[Math.floor(Math.random() * cleanIPs.length)]
    } else {
        conf.add = addressList[Math.floor(Math.random() * addressList.length)]
    }
    
    if (protocol == "vmess") {
        conf.sni = url.hostname
        conf.host = url.hostname
        if (conf.path == undefined) {
        conf.path = ""
        }
        conf.path = "/" + addr + ":" + conf.port + "/" + conf.path.replace(/^\\//g, "")
        conf.fp = fpList[Math.floor(Math.random() * fpList.length)]
        conf.alpn = alpnList[Math.floor(Math.random() * alpnList.length)]
        conf.port = 443
    }
    return conf
    } catch (e) {
    return {}
    }
}

function getMultipleRandomElements(arr, num) {
    var shuffled = arr //[...arr].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, num)
}

function isIp(str) {
    try {
    if (str == "" || str == undefined) return false
    if (!/^(\\d{1,2}|1\\d\\d|2[0-4]\d|25[0-5])(\\.(\\d{1,2}|1\\d\\d|2[0-4]\\d|25[0-5])){2}\\.(\\d{1,2}|1\\d\\d|2[0-4]\\d|25[0-4])$/.test(str)) {
        return false
    }
    var ls = str.split('.')
    if (ls == null || ls.length != 4 || ls[3] == "0" || parseInt(ls[3]) === 0) {
        return false
    }
    return true
    } catch (e) { }
    return false
}

function toClash(conf, protocol) {
    const regexUUID = /^[0-9a-fA-F]{8}\\b-[0-9a-fA-F]{4}\\b-[0-9a-fA-F]{4}\\b-[0-9a-fA-F]{4}\\b-[0-9a-fA-F]{12}$/gi
    var config = {}
    try {
    config = {
        name: conf.name ? conf.name : conf.ps,
        type: protocol,
        server: conf.add,
        port: conf.port,
        uuid: conf.id,
        alterId: 0,
        tls: true,
        cipher: conf.cipher ? conf.cipher : "auto",
        "skip-cert-verify": true,
        servername: conf.sni,
        network: conf.net,
        "ws-opts": {
        path: conf.path,
        headers: {
            host: conf.host
        }
        }
    }
    config.name = config.name.replace(/[^\\x20-\\x7E]/g, "").replace(/[\\s\\/:|\\[\\]@\\(\\)\\.]/g, "") + "-" + Math.floor(Math.random() * 10000)
    if (!regexUUID.test(config.uuid)) {
        return {}
    }
    return config
    } catch (e) {
    return {}
    }
}

function toYaml(configList) {
    var yaml = 
\`
mixed-port: 7890
allow-lan: true
log-level: info
external-controller: 0.0.0.0:9090
dns:
    enabled: true
    nameserver:
    - 1.1.1.1
    - 4.2.2.4
    - 119.29.29.29
    - 223.5.5.5
    fallback:
    - 8.8.8.8
    - 8.8.4.4
    - tls://1.0.0.1:853
    - tls://dns.google:853

proxies:
\${configList.map(cnf => "  - " + JSON.stringify(cnf)).join("\\n")}

proxy-groups:
    - name: maingroup
    type: url-test
    tolerance: 300
    url: 'https://www.google.com/generate_204'
    interval: 30
    lazy: false
    proxies:
\${configList.map(cnf => "      - " + cnf.name.trim()).join("\\n")}

rules:
    - GEOIP,IR,DIRECT
    - MATCH,maingroup

\`
return yaml;
}`;
}

export default getWorkerCode;

function softmin(values: number[]): number[] {
  const min = Math.min(...values);
  const softmaxed = values.map((v) => Math.exp(min - v));
  const sum = softmaxed.reduce((acc, cur) => acc + cur, 0);
  return softmaxed.map((v) => v / sum);
}

function sampleMultipleFromDistribution<T>(
  list: T[],
  weights: number[],
  n: number
): T[] {
  const sum = weights.reduce((acc, cur) => acc + cur, 0);
  const probabilities = weights.map((w) => w / sum);

  const cumulativeProbabilities = [];
  let cumulativeProbability = 0;
  for (let i = 0; i < probabilities.length; i++) {
    cumulativeProbability += probabilities[i];
    cumulativeProbabilities.push(cumulativeProbability);
  }

  const samples = [];
  for (let i = 0; i < n; i++) {
    const randomValue = Math.random();
    let j = 0;
    while (randomValue > cumulativeProbabilities[j]) {
      j++;
    }
    samples.push(list[j]);
  }

  return samples;
}
