function cidrToIpArray(cidr: string): string[] {
  const parts = cidr.split("/");
  const ip = parts[0];
  const mask = parseInt(parts[1], 10);
  const ipParts = ip.split(".");
  const start =
    ((parseInt(ipParts[0], 10) << 24) |
      (parseInt(ipParts[1], 10) << 16) |
      (parseInt(ipParts[2], 10) << 8) |
      parseInt(ipParts[3], 10)) >>>
    0; // convert to unsigned int
  const end = (start | (0xffffffff >>> mask)) >>> 0; // convert to unsigned int

  const ips: string[] = [];
  for (let i = start; i <= end; i++) {
    const a = (i >> 24) & 0xff;
    const b = (i >> 16) & 0xff;
    const c = (i >> 8) & 0xff;
    const d = i & 0xff;
    ips.push(`${a}.${b}.${c}.${d}`);
  }
  return ips;
}

function extractIPs(text: string): string[] {
  const regex = /(?:\d{1,3}\.){3}\d{1,3}(?:\/\d{1,2})?/g;
  const matches = text.matchAll(regex) ?? [];

  let ips: string[] = [];

  for (const match of matches) {
    const [ip, range] = match[0].split("/");
    if (!range) {
      ips = [...ips, ip];
    } else {
      ips = [...ips, ...cidrToIpArray(match[0])];
    }
  }

  return ips;
}

export default extractIPs;
