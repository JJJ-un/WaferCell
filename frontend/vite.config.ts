import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from "vite-plugin-svgr";
import tsconfigPaths from 'vite-tsconfig-paths'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [TanStackRouterVite(), react(), tailwindcss(), svgr(), tsconfigPaths()],
  define: {
    global: 'window',
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      "/ws-stomp": {
        target: "http://localhost:8080",
        changeOrigin: true,
        ws: true, // 웹소켓 프록시 활성화
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/__test__/setup.ts',
  },
})
