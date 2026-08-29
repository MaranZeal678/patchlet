import { defineConfig } from 'vite';

/** Builds the Action Compiler recorder as a single classic script. */
export default defineConfig({
  define: { 'process.env.NODE_ENV': '"production"' },
  build: {
    target: 'es2019',
    minify: false, // judges (and jsdom stack traces) read this file
    emptyOutDir: false,
    lib: {
      entry: 'src/recorder/index.ts',
      name: 'ActionCompilerRecorder',
      formats: ['iife'],
      fileName: () => 'recorder.js',
    },
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
});
