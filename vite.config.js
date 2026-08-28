import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Explicit: never ship readable source maps in the production bundle.
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('three') || id.includes('cannon-es')) return 'three';
            if (id.includes('@supabase')) return 'supabase';
            if (id.includes('lucide-react')) return 'icons';
            if (id.includes('react-router-dom')) return 'router';
            if (id.includes('react-dom') || id.includes('/react/')) return 'vendor';
          }
        },
      },
    },
  },
})
