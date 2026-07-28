import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    port: 3000,
    strictPort: true, // Optional: Nếu port 3000 bị chiếm, Vite sẽ báo lỗi thay vì tự động đổi sang port khác (ví dụ: 3001)
  }
})
