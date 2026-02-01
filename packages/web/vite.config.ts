import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.mjs',
  },
  server: {
    port: 3000,
    strictPort: false,
  },
  optimizeDeps: {
    exclude: ['sharp'],
    include: ['monaco-editor', 'zustand', 'zustand/middleware', 'lucide-react'],
  },
  build: {
    rollupOptions: {
      external: ['sharp'],
      output: {
        globals: {
          sharp: 'sharp',
        },
      },
    },
  },
});
