import { vitePlugin as remix } from '@remix-run/dev';
import { defineConfig } from 'vite';

export default defineConfig({
  ssr: {
    // this resolves a bug with pnpm, it is needed due to vite externals configuration https://vite.dev/config/ssr-options#ssr-external
    // by default vite will externalize all dependencies that are not linked (and since pnpm links everything, it will not externalize them)
    // we only need this in development as in production these dependencies are bundled together by esbuild, and are no longer referenced from the node_modules folder
    external: process.env.NODE_ENV === 'development' ? true : undefined
  },
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true
      }
    })
  ]
});
