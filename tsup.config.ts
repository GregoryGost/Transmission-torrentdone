import { defineConfig } from 'tsup';

export default defineConfig({
  outDir: 'dist',
  entry: ['src/index.ts'],
  target: 'esnext',
  format: ['cjs'],
  minify: true,
  treeshake: true,
  clean: true,
  splitting: false,
  sourcemap: false,
  dts: false
});
