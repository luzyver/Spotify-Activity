import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
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
