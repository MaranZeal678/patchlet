import { defineConfig } from "vite";

/**
 * One self-contained IIFE. Customers add it with a single script tag, so it must not assume a
 * module loader, and nothing may be left as an external import.
 */
export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["iife"],
      name: "PatchletWidget",
      fileName: () => "patchlet.js",
    },
    rollupOptions: {
      output: { inlineDynamicImports: true },
    },
    target: "es2020",
    minify: "esbuild",
    emptyOutDir: true,
  },
});
