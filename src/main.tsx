import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import App from "./App";
import theme from "./theme";
import "./index.css";
import { Analytics } from "@vercel/analytics/react";
import { registerSW } from "virtual:pwa-register";

const updateSW = registerSW({
  onOfflineReady() {},
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <App />
    </ChakraProvider>
    <Analytics mode={"production"} />
  </React.StrictMode>
);
