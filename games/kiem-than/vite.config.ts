import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // Menggunakan path relatif agar aman dibuka di folder/subfolder manapun
})