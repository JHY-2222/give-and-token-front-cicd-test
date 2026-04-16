import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8090",
        changeOrigin: true,
      },
      "/admin": {
        target: "http://localhost:8090",
        changeOrigin: true,
      },
      "/oauth2": {
        target: "http://localhost:8090",
        changeOrigin: true,
      },
      "/login/oauth2": {
        target: "http://localhost:8090",
        changeOrigin: true,
      },
      // 💡 이미지 파일(uploads) 요청도 백엔드로 전달
      "/uploads": {
        target: "http://localhost:8090",
        changeOrigin: true,
      },
    },
  },
});
