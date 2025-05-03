import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react', 'newrelic'],
  },
  build: {
    rollupOptions: {
      external: [
        '@opentelemetry/auto-instrumentations-web',
        'path',
        'node:path'
      ]
    }
  }
});