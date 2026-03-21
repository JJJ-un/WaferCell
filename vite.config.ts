import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from "vite-tsconfig-paths";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths(), svgr()],
  server: {
    proxy: {
      // 해당 부분 추후 API 주소에 맞춰 수정해야함
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
})
