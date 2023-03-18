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

import IpItem from "./IpItem.jsx";
import {
  Mutex,
  MutexInterface,
  Semaphore,
  SemaphoreInterface,
  withTimeout,
} from "async-mutex";
import { useState, useEffect } from "react";

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
  const [useAll, setUseAll] = useState<boolean>(true);

  useEffect(() => {
    const extractedIPs = extractIPs(ipText);
    setIPs(extractedIPs);
  }, [ipText]);

  useEffect(() => {
    if (useAll) {
      setIPs(extractIPs(getCloudflareIPs()));
    } else {
      setIpText(ipText == "" ? "-" : "");
    }
  }, [useAll]);

  const start = () => {
    const mutex = new Mutex();
    let validIps: { ip: string; time: number }[] = [];
    async function testIps() {
      const shuffled_ips = randomizeElements(ips);
      for (let i = 0; i < shuffled_ips.length; i++) {
        const ip = shuffled_ips[i];
        const result = await testIp(ip, timeout, pingCount);
        if (result !== null) {
          const release = await mutex.acquire();
          try {
            validIps.push(result);
            setValidIPs(validIps);
          } finally {
            release();
          }
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
      <HStack justifyContent="space-between">
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
          value={`${useAll}`}
          isChecked={useAll}
          onChange={(e) => setUseAll(e.target.checked)}
        />
      </HStack>
      <Tooltip label="here you can enter your desired IPs and IP ranges with any format you like.">
        <Input
          isDisabled={useAll || isSubmitted}
          borderRadius={20}
          placeholder="Enter All Your IPs & IP Ranges..."
          value={ipText == "" || ipText == "-" ? undefined : ipText}
          variant="filled"
          onChange={(event) => setIpText(event.target.value)}
          size="md"
        />
      </Tooltip>
      <HStack width="100%" justifyContent="center">
        <Badge colorScheme="orange">IP Count: {ips.length}</Badge>
      </HStack>
      <Tooltip label="here you can specify how many clean ips you need.">
        <NumberInput
          width="100%"
          colorScheme="orange"
          max={ips.length}
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
      <br />
      {validIPs.length > 0 && (
        <>
          <Progress
            colorScheme="orange"
            height="16px"
            width="100%"
            value={progress}
            borderRadius={20}
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
                    ></IpItem>
                  ))}
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
