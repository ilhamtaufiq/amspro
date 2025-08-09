import { defineConfig } from "vite";
import baseConfig from "./vite.config.base.js";
import { visualizer } from "rollup-plugin-visualizer";
import viteCompression from "vite-plugin-compression";

const isAnalyze = process.argv.includes("--analyze");

export default defineConfig({
  ...baseConfig,
  plugins: [
    ...baseConfig.plugins.map((plugin) => {
      if (plugin.name === "laravel") return { ...plugin, refresh: false };
      return plugin;
    }),
    viteCompression({
      algorithm: "brotliCompress",
      ext: ".br",
      threshold: 10240,
    }),
    ...(isAnalyze
      ? [
          visualizer({
            filename: "stats.html",
            template: "treemap",
            gzipSize: false,
            brotliSize: false,
            open: true,
          }),
        ]
      : []),
  ],
  build: {
    target: "es2015",
    outDir: "public/build",
    emptyOutDir: true,
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    modulePreload: { polyfill: false },
    brotliSize: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react")) return "react-vendor";
            if (id.includes("@inertiajs/react")) return "inertia-vendor";
            if (id.includes("lucide-react") || id.includes("@tabler/icons-react"))
              return "icons-vendor";
            if (id.includes("leaflet")) return "maps-vendor";
            return "vendor";
          }
        },
        chunkFileNames: "js/[name]-[hash].js",
        entryFileNames: "js/[name]-[hash].js",
        assetFileNames: ({ name }) => {
          const ext = name.split(".").pop();
          if (ext === "css") return `css/[name]-[hash].${ext}`;
          return `assets/[name]-[hash].${ext}`;
        },
      },
    },
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info", "console.debug"],
        passes: 2,
      },
      mangle: { safari10: true },
    },
    chunkSizeWarningLimit: 800,
    sourcemap: false,
  },
});
