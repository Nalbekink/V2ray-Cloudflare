function cidrToIpArray(cidr: string): string[] {
  const parts = cidr.split("/");
  const ip = parts[0];
  const mask = parseInt(parts[1], 10);
  if (isNaN(mask)) {
    return [ip];
  }
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

function cidrToIpCount(cidr: string): number {
  const parts = cidr.split("/");
  const mask = parseInt(parts[1], 10);
  if (isNaN(mask)) {
    // If subnet mask is missing or cannot be parsed, assume /32 CIDR range with 1 IP address
    return 1;
  }
  const ipCount = Math.pow(2, 32 - mask);
  return ipCount;
}

function extractIPs(text: string): string[] {
  const regex = /(?:\d{1,3}\.){3}\d{1,3}(?:\/\d{1,2})?/g;
  const matches = text.matchAll(regex) ?? [];

  let ips: string[] = [];

  for (const match of matches) {
    ips.push(match[0]);
  }

  return ips;
}

export default extractIPs;
