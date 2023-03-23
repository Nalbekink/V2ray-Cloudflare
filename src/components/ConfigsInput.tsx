import {
  Input,
  InputGroup,
  HStack,
  VStack,
  Badge,
  Stack,
  NumberInput,
  NumberInputField,
  Heading,
  Tooltip,
} from "@chakra-ui/react";
import extractConfigs from "../services/CheckFormat.js";
import { useState, useEffect } from "react";
import AlpnCheckbox from "./AlpnCheckbox";
import UserAgentsCheckbox from "./UserAgentsCheckbox";

interface props {
  alpns: string[];
  onAlpnsChange: any;
  useragents: string[];
  setUseragents: any;
  configs: any;
  setConfigs: any;
  configCount: number;
  setConfigCount: any;
  isSubmitted: boolean;
}

const ConfigsInput = ({
  alpns,
  onAlpnsChange,
  useragents,
  setUseragents,
  configs,
  setConfigs,
  configCount,
  setConfigCount,
  isSubmitted,
}: props) => {
  const [configsText, setConfigsText] = useState<string>("");

  useEffect(() => {
    const extractedConfigs = extractConfigs(configsText);
    setConfigs(extractedConfigs);
  }, [configsText]);

  return (
    <>
      <Heading p={10}>Configs Settings</Heading>
      <Tooltip label="here you can paste all your [ws and gprc] + tls configs in your desired format!">
        <Input
          isDisabled={isSubmitted}
          borderRadius={20}
          placeholder="Enter Your Configs..."
          value={configsText}
          variant="filled"
          onChange={(event) => setConfigsText(event.target.value)}
          size="md"
        />
      </Tooltip>
      <HStack width="100%" justifyContent="center">
        <Badge variant="subtle" colorScheme="red">
          VMESS: {configs[0].length}
        </Badge>
        <Badge variant="subtle" colorScheme="orange">
          VLESS: {configs[1].length}
        </Badge>
        <Badge variant="subtle" colorScheme="yellow">
          Trojan: {configs[2].length}
        </Badge>
      </HStack>
      <Tooltip label="here you can specify how many changed configs with clean IPs you need to get generated randomly!">
        <NumberInput width="100%" isDisabled={isSubmitted}>
          <NumberInputField
            borderRadius={20}
            value={configCount}
            placeholder="Enter the number of configs you need..."
            onChange={(e) => {
              if (e.target.value != "") {
                setConfigCount(parseInt(e.target.value));
              } else {
                setConfigCount(0);
              }
            }}
          />
        </NumberInput>
      </Tooltip>
      <AlpnCheckbox
        onChange={(e: string[]) => onAlpnsChange(e)}
        alpns={alpns}
      />
      <UserAgentsCheckbox
        onChange={(e: string[]) => setUseragents(e)}
        useragents={useragents}
      />
    </>
  );
};

export default ConfigsInput;
