import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    // Relative base path ensures assets resolve correctly on GitHub Pages (e.g. https://username.github.io/repo-name/)
    base: './',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve('.'),
      },
    },
    server: {
      // Completely disable HMR WebSockets to prevent browser console connection errors
      hmr: false,
      watch: null,
    },
  };
});
