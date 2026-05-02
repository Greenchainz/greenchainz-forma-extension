import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import path from "path";

export default defineConfig(({ command }) => ({
  plugins: [preact()],
  build: {
    rollupOptions: {
      input: {
        index: "index.html",
        left: "left.html",
        right: "right.html",
      },
    },
  },
  resolve: {
    alias:
      command === "serve"
        ? {
            "forma-embedded-view-sdk/auto": path.resolve(
              "./src/lib/__mocks__/forma-sdk.ts"
            ),
          }
        : {},
  },
  server: {
    port: 5000,
    host: "0.0.0.0",
    allowedHosts: true,
    cors: true,
    headers: { "Access-Control-Allow-Origin": "*" },
    proxy: {
      "/api/public": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
    },
  },
}));
