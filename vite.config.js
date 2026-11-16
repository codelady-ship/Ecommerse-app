import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Deployed to GitHub Pages at https://codelady-ship.github.io/Ecommerse-app/
// https://vite.dev/config/
export default defineConfig({
  base: '/Ecommerse-app/',
  plugins: [react(), tailwindcss()],
})
