import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Deployed to GitHub Pages at https://codelady-ship.github.io/Ecommerse-app/
// The app imports the shared catalogue and delivery rules from backend/src/lib (one source of truth).
// Tailwind only compiles src/admin/admin.css (the lazy /admin chunk); the shop's CSS has no Tailwind in it.
export default defineConfig({
  base: '/Ecommerse-app/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: { gsap: ['gsap', 'gsap/ScrollTrigger', 'gsap/Flip', 'lenis'] },
      },
    },
  },
})
