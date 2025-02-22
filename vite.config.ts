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
      "fs/promises": path.resolve(__dirname, "./src/mocks/fs-promises-mock.ts"),
      "fs": path.resolve(__dirname, "./src/mocks/fs-promises-mock.ts"),
      "chromadb": path.resolve(__dirname, "./src/mocks/chroma-mock.ts"),
      "chromadb-default-embed": path.resolve(__dirname, "./src/mocks/empty-module.ts"),
    },
  },
  optimizeDeps: {
    entries: ["src/main.tsx", "src/tempobook/**/*"],
    exclude: ['ioredis', 'redis', 'fs/promises', 'node:fs/promises', 'chromadb'],
    esbuildOptions: {
      target: 'es2020',
      // Explicitly tell esbuild to ignore fs/promises and chromadb-default-embed
      plugins: [
        {
          name: 'ignore-fs-promises-and-chroma',
          setup(build) {
            build.onResolve({ filter: /^fs\/promises$/ }, () => ({
              path: path.resolve(__dirname, "./src/mocks/fs-promises-mock.ts"),
            }));
            build.onResolve({ filter: /^chromadb-default-embed$/ }, () => ({
              path: path.resolve(__dirname, "./src/mocks/empty-module.ts"),
              external: true
            }));
          },
        },
      ],
    }
  },
  plugins: [
    nodePolyfills({
      protocolImports: true,
      exclude: ['fs', 'fs/promises', 'node:fs/promises'],
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
      external: ['redis', 'fs'],
    },
    target: 'es2020',
  }
});
