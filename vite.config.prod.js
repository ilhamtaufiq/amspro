import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    laravel({
      input: ["resources/css/app.css", "resources/js/app.tsx"],
      refresh: false, // Disable refresh in production
    }),
    react({
      jsxRuntime: "automatic",
      include: "**/*.{tsx,jsx}",
    }),
    // Uncomment untuk analisis bundle size
    visualizer({
      filename: "stats.html",
      template: "treemap",
      gzipSize: true,
      brotliSize: true,
      open: false,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "resources/js"),
    },
  },
  build: {
    target: "es2015", // Lebih kompatibel untuk production
    outDir: "public/build",
    emptyOutDir: true,
    // Optimasi chunk splitting yang lebih agresif
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks yang lebih granular
          'react-core': ['react'],
          'react-dom-core': ['react-dom'],
          'inertia-core': ['@inertiajs/react'],
          
          // UI components yang sering digunakan
          'ui-core': [
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
          
          // Icons
          'icons-lucide': ['lucide-react'],
          'icons-tabler': ['@tabler/icons-react'],
          
          // Utils
          'utils-core': [
            'class-variance-authority',
            'clsx',
            'tailwind-merge',
          ],
          'utils-date': ['date-fns'],
          'utils-search': ['cmdk'],
          'utils-charts': ['recharts'],
          
          // Maps
          'maps-core': ['leaflet'],
        },
        // Optimasi nama chunk
        chunkFileNames: 'js/[name]-[hash].js',
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
    // Optimasi minifikasi yang lebih agresif
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2,
      },
      mangle: {
        safari10: true,
      },
    },
    // Optimasi chunk size warning
    chunkSizeWarningLimit: 800,
    // Disable source maps untuk production
    sourcemap: false,
    // Optimasi CSS
    cssCodeSplit: true,
    // Optimasi assets
    assetsInlineLimit: 4096, // 4kb
  },
  // Optimasi cache
  cacheDir: 'node_modules/.vite_cache',
  // Optimasi dependencies untuk production
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
    exclude: [],
    // Force pre-bundling
    force: true,
  },
  // Optimasi CSS
  css: {
    devSourcemap: false,
    postcss: {
      plugins: [
        // Tambahkan PostCSS plugins jika diperlukan
      ],
    },
  },
  // Optimasi server untuk production
  server: {
    host: "localhost",
    port: 5173,
    strictPort: true,
  },
}); 