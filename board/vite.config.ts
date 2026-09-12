import { defineConfig } from 'vite';

export default defineConfig({
  base: '/board/',
  build: {
    target: 'es2019',
    chunkSizeWarningLimit: 2000,
  },
});
