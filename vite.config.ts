import { defineConfig } from 'vite';

export default defineConfig({
  // Relatif supaya build bisa dibuka dari subfolder GitHub Pages atau itch.io.
  base: './',
  server: { port: 5174, open: false },
  build: {
    target: 'es2022',
    rollupOptions: { output: { manualChunks: { phaser: ['phaser'] } } },
  },
});
