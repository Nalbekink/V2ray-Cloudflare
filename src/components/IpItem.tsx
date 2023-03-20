import { useState, useEffect } from "react";
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
  Text,
} from "@chakra-ui/react";
import { Skeleton, SkeletonCircle, SkeletonText } from "@chakra-ui/react";

interface props {
  ip: string;
  time: number;
  isLoaded: boolean;
}

export const IpItem = ({ ip, time, isLoaded = true }: props) => {
  return (
    <tr>
      <td width="100%">
        <Skeleton
          startColor="whiteAlpha.200"
          endColor="blackAlpha.200"
          speed={0.5}
          isLoaded={isLoaded}
          m={2}
          borderRadius={10}
        >
          <Text as="kbd" fontSize="md" p={2}>
            {ip}
          </Text>
        </Skeleton>
      </td>
      <td width="100%" style={{ textAlign: "center" }}>
        <Skeleton
          startColor="whiteAlpha.200"
          endColor="blackAlpha.200"
          speed={0.5}
          isLoaded={isLoaded}
          borderRadius={10}
          m={2}
        >
          <Text as="samp" fontSize="sm" align="right">
            {time}
          </Text>
        </Skeleton>
      </td>
    </tr>
  );
};

export default IpItem;
