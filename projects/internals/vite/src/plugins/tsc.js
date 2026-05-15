import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';

const require = createRequire(import.meta.url);
const tsgoPath = resolve(dirname(require.resolve('@typescript/native-preview/package.json')), 'bin/tsgo.js');

/**
 * Runs TSC type check on intial build
 */
export function tsc() {
  return {
    name: 'tsc',
    apply: 'build',
    async buildStart() {
      if (process.env.VITE_INITIAL_BUILD) {
        execFileSync(
          process.execPath,
          [
            tsgoPath,
            '--project',
            resolve(process.cwd(), './tsconfig.lib.json'),
            '--noEmit',
            '--emitDeclarationOnly',
            'false'
          ],
          { stdio: 'inherit' }
        );
      }
    }
  };
}
