import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/games/cyber-saber/', // <--- Ubah ke path subfolder ini
})