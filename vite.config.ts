import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { nodePolyfills } from 'vite-plugin-node-polyfills';

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
    exclude: ['ioredis', 'redis'],
  },
  plugins: [
    nodePolyfills({
      protocolImports: true,
    }),
    react({
      plugins: conditionalPlugins,
    }),
  ],
  define: {
    global: 'globalThis',
  },
  server: {
    // @ts-ignore
    allowedHosts: true,
  },
  build: {
    rollupOptions: {
      external: ['redis'],
    },
  }
});
