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
import { Grid, GridItem } from "@chakra-ui/react";

interface props {
  useragents: string[];
  onChange: any;
}
const UserAgentsCheckbox = ({ useragents, onChange }: props) => {
  const all_useragents = [
    "chrome",
    "firefox",
    "safari",
    "random",
    "randomized",
    "ios",
    "android",
    "edge",
  ];
  const getGrid = (max: number) => {
    let columns = Math.ceil(all_useragents.length / max);
    let grid = ``;
    for (let i = 0; i < columns; i++) {
      let row = `"`;
      for (let j = 0; j < max; j++) {
        if (i * max + j >= all_useragents.length) {
          row += "empty" + " ";
          continue;
        }
        row += all_useragents[i * max + j] + " ";
      }
      row += `"`;
      grid += row + " ";
    }
    return grid;
  };
  return (
    <VStack
      width="100%"
      justifyContent="center"
      alignItems="center"
      bg="gray.100"
      p={3}
      borderRadius={20}
    >
      <Tooltip label="your desired fingerprint choices">
        <Text as="b" p={[2]}>
          uTLS
        </Text>
      </Tooltip>
      <CheckboxGroup
        colorScheme="orange"
        defaultValue={useragents}
        onChange={(value) => onChange(value)}
      >
        <Grid
          templateAreas={{
            base: `${getGrid(2)}`,
            md: `${getGrid(3)}`,
            lg: `${getGrid(4)}`,
          }}
          p={5}
          width="90%"
        >
          {all_useragents.map((ua) => (
            <GridItem
              area={ua}
              alignItems="center"
              justifyContent="center"
              key={ua}
            >
              <Checkbox value={ua}>{ua}</Checkbox>
            </GridItem>
          ))}
        </Grid>
      </CheckboxGroup>
    </VStack>
  );
};

export default UserAgentsCheckbox;
