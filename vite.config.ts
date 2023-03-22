import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      generateSW: "autoUpdate",
      injectRegister: "auto",
      devOptions: {
        enabled: true,
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      },

      manifest: {
        name: "V2Ray",
        short_name: "V2Cloud",
        description: "cloudflare ip scanner",
        theme_color: "#ffffff",
        icons: [
          {
            src: "android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});
