import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import basicSsl from "@vitejs/plugin-basic-ssl";

export default defineConfig({
  plugins: [preact(), basicSsl()],
  build: {
    rollupOptions: {
      input: { left: "left.html", right: "right.html" },
    },
  },
  server: {
    port: 8081,
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
});
