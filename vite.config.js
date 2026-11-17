import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Deployed to GitHub Pages at https://codelady-ship.github.io/Ecommerse-app/
// The app imports the shared catalogue and delivery rules from backend/src/lib (one source of truth).
export default defineConfig({
  base: '/Ecommerse-app/',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: { gsap: ['gsap', 'gsap/ScrollTrigger', 'gsap/Flip', 'lenis'] },
      },
    },
  },
})
