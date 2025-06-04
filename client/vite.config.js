import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react()],
  resolve: {
    alias: {
      '@imgs': path.resolve(__dirname, './src/assets/imgs'),
    },
  },
})
