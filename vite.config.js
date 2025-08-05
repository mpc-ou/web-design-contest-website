import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import tailwindcss from "@tailwindcss/vite"

const __dirname = resolve(fileURLToPath(import.meta.url), '..')

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/',
  server: {
    allowedHosts: ['.konnn04.live', 'localhost', '.vercel.app'],
    port: 3000,
    host: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, 'src'),
      "@/components": resolve(__dirname, 'src/components'),
      "@/lib": resolve(__dirname, 'src/lib'),
      "@/utils": resolve(__dirname, 'src/lib/utils'),
      "@/hooks": resolve(__dirname, 'src/lib/hooks'),
    },
  },
  esbuild: {
    target: 'esnext',
    platform: 'neutral',
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    target: 'esnext',
    rollupOptions: {
      external: [],
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          utils: ['axios', 'clsx', 'tailwind-merge']
        },
      }
    },
    commonjsOptions: {
      include: [/node_modules/],
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }
})
