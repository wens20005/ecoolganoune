import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',  // هادي مهمة: كتخلي كل المسارات تبدأ من root
  server: {
    port: 3000,
    open: true
  }
})
