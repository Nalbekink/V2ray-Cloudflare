import { useState } from "react";
import { Image, Box, Center, VStack } from "@chakra-ui/react";
import reactLogo from "./assets/react.svg";
import lightLogo from "./assets/light-logo.png";
import darkLogo from "./assets/dark-logo.png";
import Form from "./components/Form";

function App() {
  return (
    <>
      <Box width="100%" minHeight="10vh" height="20%">
        <VStack width="100%" alignItems="center" justifyContent="center">
          <Image
            src="https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fgithub.com%2FNalbekink%2FV2ray-Cloudflare&count_bg=%23DD6B20&title_bg=%234A4A4A&icon=&icon_color=%23E7E7E7&title=Visited&edge_flat=true"
            alt="Visitors Count"
            m={5}
          />
          <Image
            src={lightLogo}
            alt="V2ray+Cloudflare"
            maxWidth="20%"
            maxHeight="80px"
          />
        </VStack>
      </Box>
      <Center width="100%" mt={20}>
        <Box width="90%" maxWidth="500px">
          <Form />
        </Box>
      </Center>
    </>
  );
}

export default App;
