import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import webExtension from "vite-plugin-web-extension";
import path from "path";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    webExtension({
      additionalInputs: ["src/blocked/index.html"],
      browser: mode === "firefox" ? "firefox" : "chrome",
      printSummary: true,
    }),
  ],
  resolve: {
    alias: {
      "@block66/shared": path.resolve(__dirname, "../shared/src/ext.ts"),
    },
  },
  build: {
    sourcemap: mode !== "production",
    rollupOptions: {
      output: {
        // Preserve src/ directory structure so vite-plugin-web-extension
        // can map manifest paths (e.g. src/background/index.ts → src/background/index.js)
        entryFileNames: (chunk) => {
          if (chunk.facadeModuleId) {
            const rel = path.relative(
              path.resolve(__dirname),
              chunk.facadeModuleId
            );
            // Normalize to forward slashes (required on Windows for the plugin)
            return rel.replace(/\\/g, "/").replace(/\.(ts|tsx)$/, ".js");
          }
          return "[name].js";
        },
        chunkFileNames: "chunks/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
}));
