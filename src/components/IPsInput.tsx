import {
  Input,
  InputGroup,
  HStack,
  VStack,
  Badge,
  Stack,
  Progress,
  Switch,
  Text,
  Button,
} from "@chakra-ui/react";
import {
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  NumberInputField,
  NumberInput,
  Heading,
  Tooltip,
} from "@chakra-ui/react";
import extractIPs from "../services/ExtractIPs";
import testIp from "../services/TestIp";
import getCloudflareIPs from "../services/GetCloudflareIPs";
import { Grid, GridItem } from "@chakra-ui/react";
import IpItem from "./IpItem.jsx";
import {
  Mutex,
  MutexInterface,
  Semaphore,
  SemaphoreInterface,
  withTimeout,
} from "async-mutex";
import { useState, useEffect } from "react";
import { Skeleton, SkeletonCircle, SkeletonText } from "@chakra-ui/react";
import { Fade, ScaleFade, Slide, SlideFade } from "@chakra-ui/react";

interface props {
  maxIP: number;
  setMaxIP: (value: number) => void;
  validIPs: { ip: string; time: number }[];
  setValidIPs: (value: { ip: string; time: number }[]) => void;
  ips: string[];
  setIPs: (value: string[]) => void;
  pingCount: number;
  setPingCount: (value: number) => void;
  timeout: number;
  setTimeout: (value: number) => void;
  isSubmitted: boolean;
  setSubmitted: (value: boolean) => void;
}

const IPsInput = ({
  ips,
  setIPs,
  validIPs,
  setValidIPs,
  maxIP,
  setMaxIP,
  pingCount,
  setPingCount,
  timeout,
  setTimeout,
  isSubmitted,
  setSubmitted,
}: props) => {
  const [ipText, setIpText] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [useAll, setUseAll] = useState<boolean>(false);
  const [useUK, setUseUK] = useState<boolean>(true);

  const [testedIPCount, setTestedIPCount] = useState<number>(0);

  useEffect(() => {
    const extractedIPs = extractIPs(ipText);
    setIPs(extractedIPs);
  }, [ipText]);

  useEffect(() => {
    console.log(testedIPCount);
  }, [testedIPCount]);

  useEffect(() => {
    if (useAll) {
      setIPs(extractIPs(getCloudflareIPs(true)));
      setUseUK(false);
    } else if (useUK) {
      setIPs(extractIPs(getCloudflareIPs(false)));
    } else {
      setIpText(ipText == "" ? "-" : "");
    }
  }, [useAll, useUK]);

  const start = () => {
    const validMutex = new Mutex();
    const allMutex = new Mutex();
    let validIps: { ip: string; time: number }[] = [];
    const weights: number[] = ips.map((a) => Math.sqrt(cidrToIpCount(a)));
    const sum = ips
      .map((a) => cidrToIpCount(a))
      .reduce((acc, cur) => acc + cur, 0);
    setTestedIPCount(0);
    setValidIPs([]);

    async function testIps() {
      for (let i = 0; i < sum; i++) {
        const ip_range = cidrToIpArray(sampleFromDistribution(ips, weights));
        const ip = ip_range[Math.floor(Math.random() * ip_range.length)];
        const result = await testIp(ip, timeout, pingCount);

        await allMutex.runExclusive(async () => {
          setTestedIPCount((prevCount) => Math.max(prevCount + 1, i + 1));
        });

        if (result !== null) {
          await validMutex.runExclusive(async () => {
            validIps.push(result);
            setValidIPs(validIps);
          });
        }
        const currentProgress = ((validIps.length + 1) / maxIP) * 100;

        if (validIps.length >= maxIP) {
          break;
        }
        setProgress(Math.max(currentProgress, progress));
      }
      setSubmitted(false);
    }

    testIps();
  };

  return (
    <>
      <Heading p={10}>IP Settings</Heading>
      <Grid
        templateAreas={{
          base: `"all" "uk"`,
          lg: `"all uk"`,
        }}
      >
        <GridItem area={"all"} alignItems="center" justifyContent="center">
          <Tooltip label="If ON, it will use all the cloudflare IPs. otherwise you should specify the ips & ip ranges yourself.">
            <Text as="b" color="gray.600">
              Use All IPs?
            </Text>
          </Tooltip>
          <Switch
            p={5}
            isDisabled={isSubmitted}
            colorScheme="orange"
            size="lg"
            value={`${useAll}`}
            isChecked={useAll}
            onChange={(e) => setUseAll(e.target.checked)}
          />
        </GridItem>
        <GridItem area={"uk"} alignItems="center" justifyContent="center">
          <Tooltip label="If ON, it will only use the uk datacenter IPs. otherwise you should specify the ips & ip ranges yourself.">
            <Text as="b" color="gray.600">
              Use All UK IPs?
            </Text>
          </Tooltip>
          <Switch
            p={5}
            isDisabled={isSubmitted}
            colorScheme="orange"
            size="lg"
            value={`${useUK}`}
            isChecked={useUK}
            onChange={(e) => setUseUK(e.target.checked)}
          />
        </GridItem>
      </Grid>
      <Tooltip label="here you can enter your desired IPs and IP ranges with any format you like.">
        <Input
          isDisabled={useAll || useUK || isSubmitted}
          borderRadius={20}
          placeholder="Enter All Your IPs & IP Ranges..."
          value={ipText == "" || ipText == "-" ? undefined : ipText}
          variant="filled"
          onChange={(event) => setIpText(event.target.value)}
          size="md"
        />
      </Tooltip>
      <HStack width="100%" justifyContent="center">
        <Badge colorScheme="orange">
          IP Count:{" "}
          {ips.map((a) => cidrToIpCount(a)).reduce((acc, cur) => acc + cur, 0)}
        </Badge>
      </HStack>
      <Tooltip label="here you can specify how many clean ips you need.">
        <NumberInput
          width="100%"
          colorScheme="orange"
          max={ips
            .map((a) => cidrToIpCount(a))
            .reduce((acc, cur) => acc + cur, 0)}
          value={maxIP ? maxIP : undefined}
          isDisabled={isSubmitted}
        >
          <NumberInputField
            borderRadius={20}
            placeholder="Enter the number of valid IPs you need..."
            onChange={(e) => {
              if (e.target.value != "") {
                setMaxIP(parseInt(e.target.value));
              } else {
                setMaxIP(0);
              }
            }}
          />
        </NumberInput>
      </Tooltip>
      <HStack width="100%" justifyContent="space-between">
        <Tooltip label="here you can specify how many time you need an IP to be tested. the more, the more consistent but also slower.">
          <NumberInput
            width="50%"
            colorScheme="orange"
            size="sm"
            value={pingCount ? pingCount : undefined}
            isDisabled={isSubmitted}
          >
            <NumberInputField
              borderRadius={20}
              placeholder="Ping Count. (recommended 5)"
              onChange={(e) => {
                if (e.target.value != "") {
                  setPingCount(parseInt(e.target.value));
                } else {
                  setPingCount(0);
                }
              }}
            />
          </NumberInput>
        </Tooltip>
        <Tooltip label="here you can specify what's the maximum timeout per ping, the lower, probably the better but also less likely to find IPs.">
          <NumberInput
            width="50%"
            size="sm"
            colorScheme="orange"
            value={timeout ? timeout : undefined}
            isDisabled={isSubmitted}
          >
            <NumberInputField
              borderRadius={20}
              placeholder="Timeout. (recommended 2500)"
              onChange={(e) => {
                if (e.target.value != "") {
                  setTimeout(parseInt(e.target.value));
                } else {
                  setTimeout(0);
                }
              }}
            />
          </NumberInput>
        </Tooltip>
      </HStack>
      <br />
      <Tooltip label="Start Testing the IPs..">
        <Button
          as={"a"}
          isLoading={isSubmitted}
          isDisabled={!(maxIP && pingCount && timeout)}
          colorScheme="orange"
          width="100%"
          borderRadius={20}
          m={20}
          onClick={(e) => {
            setSubmitted(true);
            start();
          }}
        >
          Start
        </Button>
      </Tooltip>
      {testedIPCount > 0 && (
        <HStack>
          <br />
          <Badge variant="subtle" colorScheme="orange">
            Tested: {testedIPCount}
          </Badge>
          <Badge variant="subtle" colorScheme="red">
            Failed: {testedIPCount - validIPs.length}
          </Badge>
          <Badge variant="subtle" colorScheme="green">
            Succeeded: {validIPs.length}
          </Badge>
        </HStack>
      )}
      <br />
      {validIPs.length > 0 && (
        <>
          <Progress
            colorScheme="orange"
            height="16px"
            width="100%"
            hasStripe
            value={progress}
            borderRadius={20}
            isAnimated={true}
          />
          <TableContainer width="100%">
            <Table size="sm" variant="striped" colorScheme="orange">
              <TableCaption>Valid IPs</TableCaption>
              <Thead>
                <Tr>
                  <Th>IP</Th>
                  <Th>Latency</Th>
                </Tr>
              </Thead>
              <Tbody>
                <>
                  {validIPs
                    .sort(
                      (
                        a1: { ip: string; time: number },
                        a2: { ip: string; time: number }
                      ) => a1.time - a2.time
                    )
                    .map((ipObj: { ip: string; time: number }) => (
                      <IpItem
                        key={ipObj.ip}
                        ip={ipObj.ip}
                        time={ipObj.time}
                        isLoaded={true}
                      ></IpItem>
                    ))}
                  {isSubmitted && (
                    <IpItem
                      isLoaded={false}
                      ip={"192.168.0.1"}
                      time={10000}
                    ></IpItem>
                  )}
                </>
              </Tbody>
            </Table>
          </TableContainer>
        </>
      )}
    </>
  );
};

export default IPsInput;

function randomizeElements(arr: string[]) {
  const shuffledList = [...arr];

  for (let i = shuffledList.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledList[i], shuffledList[j]] = [shuffledList[j], shuffledList[i]];
  }

  return shuffledList;
}

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
