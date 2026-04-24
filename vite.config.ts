import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import basicSsl from "@vitejs/plugin-basic-ssl";

// The extension has two entry points — left panel (search) and right panel (analysis)
// HTTPS is required because Forma (https://app.autodeskforma.eu) refuses to load
// HTTP iframes as mixed content.
export default defineConfig({
  plugins: [preact(), basicSsl()],
  build: {
    rollupOptions: {
      input: {
        left: "left.html",
        right: "right.html",
      },
    },
  },
  server: {
    port: 8081,
    // Forma loads the extension in an iframe — allow all origins in dev
    cors: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
});
