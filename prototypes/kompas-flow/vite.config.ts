import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

// Relative base: the same build works from `vite preview` and from the copy inside the built
// Storybook (`storybook-static/prototypes/kompas-flow/`). Routing is hash-based for the same reason.
export default defineConfig({
  base: './',
  plugins: [tailwindcss()],
  build: {
    // One bundle with React, Base UI and the DS is fine for a review prototype.
    chunkSizeWarningLimit: 800,
    rolldownOptions: {
      // Base UI marks modules with 'use client' (for Next.js); irrelevant in this bundle.
      onwarn(warning, warn) {
        if (warning.code !== 'MODULE_LEVEL_DIRECTIVE') warn(warning);
      },
    },
  },
});
