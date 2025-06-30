import { execSync } from 'node:child_process';
import fs from 'fs';
import { resolve } from 'path';

export function bundle() {
  return {
    name: 'bundle',
    apply: 'build',
    async buildEnd() {
      if (process.env.VITE_INITIAL_BUILD) {
        const hasBundleEntrypoint = fs.existsSync(resolve(process.cwd(), './src/bundle.ts'));
        if (hasBundleEntrypoint) {
          const hasBundleConfig = fs.existsSync(resolve(process.cwd(), './vite.bundle.ts'));
          const configPath = hasBundleConfig
            ? resolve(process.cwd(), './vite.bundle.ts')
            : new URL('../configs/build.bundle.js', import.meta.url).toString().replace('file://', '');
          execSync(`NODE_ENV=production vite build --config ${configPath}`, { stdio: 'inherit' });
        }
      }
    }
  };
}
