import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    allowedHosts: ['.konnn04.live', 'localhost'],
    port: 3000,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
