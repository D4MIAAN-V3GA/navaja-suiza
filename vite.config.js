import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Sin esto, Vite minifica los @media a sintaxis de rango — `(width<=720px)` —
    // que Safari <16.4 y los navegadores embebidos de Instagram/TikTok ignoran
    // por completo: se caían TODOS los breakpoints y el móvil quedaba con el
    // layout de escritorio. Objetivo conservador = `(max-width: 720px)` de siempre.
    cssTarget: ['chrome87', 'safari13.1', 'firefox78', 'edge88'],
  },
})
