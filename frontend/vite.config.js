import { defineConfig } from 'vite';

export default defineConfig({
  root: './', // Adjust if index.html is in a subdirectory
  build: {
    outDir: 'dist',
  },
});