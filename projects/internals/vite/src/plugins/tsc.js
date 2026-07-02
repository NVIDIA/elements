import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';

const require = createRequire(import.meta.url);
const tscPath = resolve(dirname(require.resolve('typescript-7/package.json')), 'bin/tsc');

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
            tscPath,
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
