import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => {
  const isDev = command === 'serve';

  return {
    plugins: [
      laravel({
        input: ['resources/js/app.tsx'],
        refresh: true,
      }),
      react(),
    ],

    server: isDev
      ? {
          watch: {
            ignored: [
              '**/vendor/**',
              '**/storage/**',
              '**/node_modules/**',
              '**/public/**',
              '**/bootstrap/**',
            ],
          },
          hmr: {
            overlay: true, // tampilkan error di browser
          },
        }
      : {},

    build: {
      sourcemap: false, // matikan sourcemap di dev untuk speed
      chunkSizeWarningLimit: 1000, // jangan rewel kalau bundle besar
    },

    optimizeDeps: {
      include: ['react', 'react-dom', '@inertiajs/react'],
      exclude: ['@vite/client'],
    },

    cacheDir: 'node_modules/.vite', // cache modul agar reload cepat
  };
});
