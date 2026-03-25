import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
const proxyConfig = {
  '/api': {
    target: process.env.API_PROXY_TARGET || 'http://localhost:4000',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, ''),
  },
  '/socket.io': {
    target: process.env.SOCKET_PROXY_TARGET || 'http://localhost:3003',
    changeOrigin: true,
    ws: true,
  },
}

export default defineConfig({
  plugins: [react()],
  build: {
    minify: 'esbuild',
  },
  resolve: {
    dedupe: [
      '@reown/appkit',
    ],
  },
  optimizeDeps: {
    include: [
      '@reown/appkit',
      '@reown/appkit-adapter-wagmi',
    ],
  },
  server: {
    port: 3000,
    host: true,
    allowedHosts: true,
    proxy: proxyConfig,
  },
  preview: {
    port: 4173,
    host: true,
    allowedHosts: true,
    proxy: proxyConfig,
  },
})
