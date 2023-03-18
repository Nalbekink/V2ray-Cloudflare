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
interface props {
  ip: string;
  time: number;
}

export const IpItem = ({ ip, time }: props) => {
  return (
    <tr>
      <td width="100%">
        <Text as="kbd" fontSize="md" p={2}>
          {ip}
        </Text>
      </td>
      <td width="100%" style={{ textAlign: "center" }}>
        <Text as="samp" fontSize="sm" align="right">
          {time}
        </Text>
      </td>
    </tr>
  );
};

export default IpItem;
