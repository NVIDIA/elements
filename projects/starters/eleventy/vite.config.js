import { defineConfig } from 'vite';

const pagesBaseUrl = (process.env.PAGES_BASE_URL ?? '/elements/').replace(/\/+$/, '');
export const BASE_URL = `${pagesBaseUrl}/starters/eleventy/`;

export const viteOptions = {
  base: BASE_URL,
  build: {
    target: 'esnext',
    sourcemap: false,
    reportCompressedSize: false
  }
};

export default defineConfig(viteOptions);
