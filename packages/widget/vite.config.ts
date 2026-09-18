/*
 * Patchlet
 * Copyright (c) 2026 Elamaran Elangovan and Aadi Dahake. All rights reserved.
 *
 * Proprietary and confidential. Rights held solely by the copyright holders.
 * No licence is granted to any other party. See LICENSE at the repository root.
 * Ref: PTCH-CYEP-P7KH3E-BLOTE
 */

import { defineConfig } from 'vite';

export default defineConfig({
  esbuild: { jsx: 'automatic', jsxImportSource: 'preact' },
  define: { 'process.env.NODE_ENV': '"production"' },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    cssCodeSplit: false,
    emptyOutDir: true,
    lib: {
      entry: 'src/loader.tsx',
      name: 'PatchletWidget',
      formats: ['iife'],
      fileName: () => 'patchlet.js',
    },
    rollupOptions: {
      output: { inlineDynamicImports: true },
    },
  },
});
