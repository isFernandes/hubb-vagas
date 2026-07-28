import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    root: resolve(__dirname),
    environment: 'node',
    alias: {
      src: resolve(__dirname, './src'),
    },
    setupFiles: [resolve(__dirname, './vitest.setup.ts')],
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
});
