import { execSync } from 'node:child_process';
import { resolve } from 'path';

/**
 * Runs TSC type check on intial build
 */
export function tsc() {
  return {
    name: 'tsc',
    apply: 'build',
    async buildStart() {
      if (process.env.VITE_INITIAL_BUILD) {
        execSync(
          `tsc --project ${resolve(process.cwd(), './tsconfig.lib.json')} --noEmit --emitDeclarationOnly false`,
          {
            stdio: 'inherit'
          }
        );
      }
    }
  };
}
