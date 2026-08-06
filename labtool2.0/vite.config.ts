import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react({ jsxRuntime: "classic" })],
  build: {
    outDir: "build",
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
    open: true,
  },
});
