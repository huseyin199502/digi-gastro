import { defineConfig } from 'vite';

export default defineConfig({
  base: '/quiz/',
  build: {
    target: 'es2019',
    chunkSizeWarningLimit: 2000,
  },
});
