import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  optimizeDeps: {
    include: ['lucide-svelte', 'clsx', 'tailwind-merge'],
    exclude: ['@sveltejs/kit']
  },
  build: {
    target: 'esnext'
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://worker-spotify.luzyver.dev',
        changeOrigin: true,
        secure: true,
      },
      '/trigger': {
        target: 'https://worker-spotify.luzyver.dev',
        changeOrigin: true,
        secure: true,
      }
    }
  }
});
