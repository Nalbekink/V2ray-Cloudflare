import {
  HStack,
  VStack,
  Checkbox,
  CheckboxGroup,
  useCheckbox,
  Stack,
  Text,
  Box,
  useCheckboxGroup,
  Tooltip,
} from "@chakra-ui/react";

import React from "react";

interface props {
  alpns: string[];
  onChange: any;
}
const AlpnCheckbox = ({ alpns, onChange }: props) => {
  return (
    <VStack
      width="100%"
      justifyContent="center"
      alignItems="center"
      bg="gray.100"
      p={3}
      borderRadius={20}
    >
      <Tooltip label="without alpn your config's traffic will be unique & easier to block!">
        <Text as="b" p={[2]}>
          Application-Layer Protocol Negotiation
        </Text>
      </Tooltip>
      <CheckboxGroup
        colorScheme="orange"
        defaultValue={alpns}
        onChange={(value) => onChange(value)}
      >
        <Stack spacing={[1, 5]} direction={["column", "row"]}>
          <Checkbox value="h2">h2</Checkbox>
          <Checkbox value="http/1.1">http/1.1</Checkbox>
          <Checkbox value="h2,http/1.1">h2+http/1.1</Checkbox>
        </Stack>
      </CheckboxGroup>
    </VStack>
  );
};

export default AlpnCheckbox;
