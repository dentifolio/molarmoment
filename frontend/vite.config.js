// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  root: './', // Ensure this points to the directory containing index.html
  build: {
    outDir: 'dist', // Output directory
  },
});