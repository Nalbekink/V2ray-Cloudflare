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
            src="https://visitor-badge.feriirawann.repl.co?username=nalbekink&repo=v2Cloud&color=F6AD55&label=Visited"
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
