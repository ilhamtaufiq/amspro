import path from "path";
import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    laravel({
      input: ["resources/css/app.css", "resources/js/app.tsx"],
    }),
    react({
      jsxRuntime: "automatic",
      include: "**/*.{tsx,jsx}",
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "resources/js"),
    },
  },
  cacheDir: "node_modules/.vite_cache",
  css: { devSourcemap: false },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "@inertiajs/react",
      "lucide-react",
      "@tabler/icons-react",
      "class-variance-authority",
      "clsx",
      "tailwind-merge",
      "date-fns",
      "cmdk",
      "recharts",
      "leaflet",
    ],
  },
});
