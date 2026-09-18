/*
 * Patchlet
 * Copyright (c) 2026 Elamaran Elangovan and Aadi Dahake. All rights reserved.
 *
 * Proprietary and confidential. Rights held solely by the copyright holders.
 * No licence is granted to any other party. See LICENSE at the repository root.
 * Ref: PTCH-CYEP-P7KH3E-BLOTE
 */

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
