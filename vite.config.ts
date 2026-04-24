import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  // Project pages are published at https://rosenden.github.io/chapse/
  // Keep dev at root while forcing the correct base path for production builds.
  const base = command === 'build' ? '/chapse/' : '/'

  return {
    base,
    plugins: [react()],
    resolve: {
      dedupe: ['react', 'react-dom'],
    },
  }
})
