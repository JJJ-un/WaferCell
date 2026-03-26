import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from "vite-plugin-svgr";
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), svgr(), tsconfigPaths()],
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
})
