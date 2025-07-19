import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    laravel({
      input: ["resources/css/app.css", "resources/js/app.tsx"],
      refresh: ["resources/js/**/*", "resources/views/**/*.blade.php"],
    }),
    react({
      jsxRuntime: "automatic", // Sudah default tapi eksplisitkan untuk future-proofing
      include: "**/*.{tsx,jsx}", // Tambahan jika ada ekstensi campuran
    }),
    // visualizer({
    //   filename: "stats.json", // bisa juga json
    //   template: "treemap", // atau "sunburst", "network"
    //   gzipSize: true,
    //   brotliSize: true,
    //   open: true,
    // }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "resources/js"),
    },
  },
  server: {
    host: "localhost",
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true,
    },
  },
  build: {
    target: "esnext",
    outDir: "public/build",
    emptyOutDir: true,
  },
  cacheDir: 'node_modules/.vite_cache',
});
