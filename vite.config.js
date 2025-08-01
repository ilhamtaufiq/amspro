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
      jsxRuntime: "automatic",
      include: "**/*.{tsx,jsx}",
    }),
    // Uncomment untuk analisis bundle size
    // visualizer({
    //   filename: "stats.html",
    //   template: "treemap",
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
    // watch: {
    //   usePolling: true,
    // },
  },
  build: {
    target: "esnext",
    outDir: "public/build",
    emptyOutDir: true,
    // Optimasi chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'inertia-vendor': ['@inertiajs/react'],
          'ui-vendor': [
            "@radix-ui/react-alert-dialog",
            "@radix-ui/react-avatar",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-collapsible",
            "@radix-ui/react-context-menu",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-label",
            "@radix-ui/react-popover",
            "@radix-ui/react-progress",
            "@radix-ui/react-scroll-area",
            "@radix-ui/react-select",
            "@radix-ui/react-separator",
            "@radix-ui/react-slot",
            "@radix-ui/react-switch",
            "@radix-ui/react-tabs",
            "@radix-ui/react-toast",
            "@radix-ui/react-toggle",
            "@radix-ui/react-toggle-group",
            "@radix-ui/react-tooltip",
          ],
          'icons-vendor': [
            'lucide-react',
            '@tabler/icons-react',
          ],
          'utils-vendor': [
            'class-variance-authority',
            'clsx',
            'tailwind-merge',
            'date-fns',
            'cmdk',
            'recharts',
          ],
          'leaflet-vendor': [
            'leaflet',
          ],
        },
        // Optimasi nama chunk
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `js/[name]-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(css)$/.test(assetInfo.name)) {
            return `css/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        },
      },
    },
    // Optimasi minifikasi
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Optimasi chunk size warning
    chunkSizeWarningLimit: 1000,
    // Optimasi source maps
    sourcemap: false,
  },
  // Optimasi cache
  cacheDir: 'node_modules/.vite_cache',
  // Optimasi dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@inertiajs/react',
      'lucide-react',
      '@tabler/icons-react',
      'class-variance-authority',
      'clsx',
      'tailwind-merge',
      'date-fns',
      'cmdk',
      'recharts',
      'leaflet',
    ],
    exclude: [
      // Exclude large dependencies that should be loaded dynamically
    ],
  },
  // Optimasi CSS
  css: {
    devSourcemap: false,
  },
});
