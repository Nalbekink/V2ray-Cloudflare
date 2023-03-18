import {
  Input,
  InputGroup,
  HStack,
  VStack,
  Badge,
  Stack,
  Switch,
  Text,
  Button,
  ButtonGroup,
  Highlight,
  Heading,
  AvatarGroup,
  Avatar,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import ConfigsInput from "./ConfigsInput.jsx";
import IPsInput from "./IPsInput.jsx";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import js from "react-syntax-highlighter/dist/esm/languages/hljs/javascript";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";
import getWorkerCode from "../services/GetWorkerCode.js";
import changeConfigs from "../services/ChangeConfigs.js";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { SiBitcoin, SiEthereum } from "react-icons/si";
import { MdEmail } from "react-icons/md";
import vahid from "../assets/vahid.jpg";
import segaro from "../assets/segaro.jpg";
import teegra from "../assets/teegra.jpg";
import { Grid, GridItem } from "@chakra-ui/react";

SyntaxHighlighter.registerLanguage("javascript", js);

const Form = () => {
  const [ips, setIPs] = useState<string[]>([]);
  const [validIPs, setValidIPs] = useState<{ ip: string; time: number }[]>([]);
  const [maxIP, setMaxIP] = useState<number>(0);
  const [pingCount, setPingCount] = useState<number>(0);
  const [timeout, setTimeout] = useState<number>(0);

  const [configVisible, setConfigVisiblity] = useState<boolean>(false);
  const [configs, setConfigs] = useState<Array<any>>([[], [], []]);
  const [configCount, setConfigCount] = useState<number>(0);
  const [alpns, setAlpns] = useState<string[]>([
    "h2",
    "http/1.1",
    "h2,http/1.1",
  ]);
  const [changedConfigs, setChangedConfigs] = useState<string[]>([]);

  const [createWorker, setCreateWorker] = useState<boolean>(false);
  const [isSubmitted, setSubmitted] = useState<boolean>(false);

  const toast = useToast();

  useEffect(() => {
    changedConfigs.map((config) => {
      console.log(config);
    });
  }, [changedConfigs]);

  useEffect(() => {
    if (isSubmitted) {
      console.log("submitted!");
    } else {
      setChangedConfigs(
        changeConfigs(
          [...configs[0], ...configs[1], ...configs[2]],
          validIPs,
          configCount,
          alpns
        )
          .split(/\n/)
          .slice(0, -1)
      );
    }
  }, [isSubmitted]);

  return (
    <InputGroup>
      <VStack width="100%">
        <Grid
          templateAreas={{
            base: `"config" "worker"`,
            lg: `"config worker"`,
          }}
        >
          <GridItem area={"config"} alignItems="center" justifyContent="center">
            <Tooltip label="If On, you can recreate your websocket & grpc configs with clean IPs!">
              <Text as="b" color="gray.600">
                Create Configs?
              </Text>
            </Tooltip>
            <Switch
              p={5}
              colorScheme="orange"
              size="lg"
              value={`${configVisible}`}
              onChange={(e) => setConfigVisiblity(e.target.checked)}
            />
          </GridItem>
          <GridItem area={"worker"} alignItems="center">
            <Tooltip label="If ON, it will generate a worker code for Clash & V2Ray subscription based on the clean IPs!">
              <Text as="b" color="gray.600">
                Generate Worker Code?
              </Text>
            </Tooltip>
            <Switch
              p={5}
              colorScheme="orange"
              size="lg"
              value={`${createWorker}`}
              onChange={(e) => setCreateWorker(e.target.checked)}
            />
          </GridItem>
        </Grid>
        {configVisible && (
          <ConfigsInput
            alpns={alpns}
            onAlpnsChange={setAlpns}
            configs={configs}
            setConfigs={setConfigs}
            configCount={configCount}
            setConfigCount={setConfigCount}
            isSubmitted={isSubmitted}
          />
        )}
        <IPsInput
          ips={ips}
          setIPs={setIPs}
          validIPs={validIPs}
          setValidIPs={setValidIPs}
          maxIP={maxIP}
          setMaxIP={setMaxIP}
          pingCount={pingCount}
          setPingCount={setPingCount}
          timeout={timeout}
          setTimeout={setTimeout}
          isSubmitted={isSubmitted}
          setSubmitted={setSubmitted}
        />
        <br />
        <CopyToClipboard
          text={validIPs
            .sort((a1, a2) => a1.time - a2.time)
            .map((ipObj) => ipObj.ip)
            .join("\n")}
        >
          <Button
            as={"a"}
            isDisabled={validIPs.length <= 1}
            colorScheme="orange"
            width="50%"
            borderRadius={20}
            mt={20}
            onClick={() => {
              validIPs.length > 1 &&
                toast({
                  title: "IPs Copied.",
                  description:
                    "IPs Copied to Your Clipboard Sorted by Their Latency.",
                  status: "success",
                  duration: 3000,
                  isClosable: true,
                });
            }}
          >
            Copy IPs to Clipboard
          </Button>
        </CopyToClipboard>

        {changedConfigs.length && configVisible && !isSubmitted && (
          <>
            <Heading p={10}>Configs</Heading>
            {changedConfigs.map((config) => (
              <CopyToClipboard text={config}>
                <Text
                  as="kbd"
                  key={config}
                  width="100%"
                  noOfLines={1}
                  cursor={"pointer"}
                  style={{ wordBreak: "break-all" }}
                >
                  <Highlight
                    query={
                      config.search("vmess") != -1
                        ? "vmess"
                        : config.search("vless") != -1
                        ? "vless"
                        : "trojan"
                    }
                    styles={{
                      px: "2",
                      py: "1",
                      bg: `orange.${
                        config.search("vmess") != -1
                          ? "100"
                          : config.search("vless") != -1
                          ? "300"
                          : "500"
                      }`,
                      rounded: "full",
                    }}
                  >
                    {config}
                  </Highlight>
                </Text>
              </CopyToClipboard>
            ))}
            <br />
            <CopyToClipboard text={changedConfigs.join("\n")}>
              <Button
                as={"a"}
                isLoading={isSubmitted}
                isDisabled={!(maxIP && pingCount && timeout)}
                colorScheme="orange"
                width="50%"
                borderRadius={20}
                mt={20}
                onClick={() => {
                  !isSubmitted &&
                    toast({
                      title: "Configs Copied.",
                      description: "Configs Copied to Your Clipboard!",
                      status: "success",
                      duration: 3000,
                      isClosable: true,
                    });
                }}
              >
                Copy Configs to Clipboard
              </Button>
            </CopyToClipboard>
            <br />
          </>
        )}
        {createWorker && !isSubmitted && (
          <>
            <Heading p={10}>Worker Code</Heading>
            <SyntaxHighlighter
              customStyle={{
                width: "100%",
                maxHeight: "600px",
                fontSize: "0.3em",
              }}
              style={docco}
              language="javascript"
              showLineNumbers={true}
              wrapLongLines={true}
            >
              {getWorkerCode(validIPs)}
            </SyntaxHighlighter>
            <br />
            <CopyToClipboard text={getWorkerCode(validIPs)}>
              <Button
                as={"a"}
                isDisabled={validIPs.length <= 1}
                colorScheme="orange"
                width="50%"
                borderRadius={20}
                mt={20}
              >
                Copy Code to Clipboard
              </Button>
            </CopyToClipboard>
          </>
        )}

        <VStack p={[5]}>
          <Text as="b" fontSize="md">
            Thanks to
          </Text>
          <AvatarGroup size="md" max={3}>
            <Avatar name="iSegaro" src={segaro} />
            <Avatar name="Vahid Faird" src={vahid} />
            <Avatar name="Teegra 🧝‍♀️" src={teegra} />
          </AvatarGroup>
        </VStack>

        <VStack p={[5]}>
          <Text as="b" fontSize="lg">
            Donate Me!
          </Text>
          <HStack>
            <>
              <SiBitcoin color="#F6AD55" />
              <CopyToClipboard text={"1873hb4kL9Dyc1aEL2jTG9Lx2DKbnfvUow"}>
                <Text as="kbd" cursor={"cell"}>
                  1873hb4kL9Dyc1aEL2jTG9Lx2DKbnfvUow
                </Text>
              </CopyToClipboard>
            </>
          </HStack>
          <HStack>
            <>
              <SiEthereum color="#F6AD55" />
              <CopyToClipboard
                text={"0xb84efe1385314f332EcA317637a92EcC3Bc40f9a"}
              >
                <Text as="kbd" cursor={"cell"}>
                  0xb84efe1385314f332EcA317637a92EcC3Bc40f9a
                </Text>
              </CopyToClipboard>
            </>
          </HStack>
        </VStack>

        <HStack>
          <>
            <MdEmail color="#F6AD55" />
            <Text as="a" cursor={"cell"} href="mailto:nalbekink@gmail.com">
              nalbekink@gmail.com
            </Text>
          </>
        </HStack>
      </VStack>
    </InputGroup>
  );
};

export default Form;
