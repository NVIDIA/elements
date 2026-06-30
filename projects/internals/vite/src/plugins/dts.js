import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { globSync } from 'glob';

const require = createRequire(import.meta.url);
const tscPath = resolve(dirname(require.resolve('typescript-7/package.json')), 'bin/tsc');

/**
 * Generates type definition files for published package
 */
export function dts() {
  return {
    name: 'dts',
    apply: 'build',
    buildStart() {
      const cwd = process.cwd();
      const srcDir = resolve(cwd, 'src');
      const outDirIndex = process.argv.findIndex(arg => arg === '--outDir') + 1;
      const outDir = resolve(cwd, outDirIndex ? process.argv[outDirIndex] : 'dist');

      execFileSync(process.execPath, [tscPath, '--project', resolve(cwd, 'tsconfig.lib.json'), '--outDir', outDir], {
        stdio: 'inherit'
      });

      globSync('**/*.d.ts', {
        cwd: srcDir,
        ignore: ['**/*.test.d.ts', '**/*.test.*.d.ts', '**/*.examples.d.ts']
      }).forEach(file => {
        const destination = resolve(outDir, file);
        mkdirSync(dirname(destination), { recursive: true });
        copyFileSync(resolve(srcDir, file), destination);
      });
    }
  };
}
