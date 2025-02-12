import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { nodeStdlibBrowser } from "vite-plugin-node-stdlib-browser";

const conditionalPlugins: [string, Record<string, any>][] = [];

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === "development" ? "/" : process.env.VITE_BASE_PATH || "/",
  resolve: {
    preserveSymlinks: true,
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    entries: ["src/main.tsx", "src/tempobook/**/*"],
    exclude: ['ioredis'],
  },
  plugins: [
    nodeStdlibBrowser(),
    react({
      plugins: conditionalPlugins,
    }),
  ],
  server: {
    // @ts-ignore
    allowedHosts: true,
  }
});
