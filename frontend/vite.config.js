// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: '.', // or 'src' if you keep code in src
  build: {
    outDir: 'dist',
  },
})