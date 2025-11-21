import { resolve } from 'path';
import { writeFileSync, readFileSync } from 'fs';

/**
 * Generates bundled type definition files for published package
 */
export function dtsBundle() {
  return {
    name: 'dts-bundle',
    apply: 'build',
    async closeBundle() {
      const { generateDtsBundle } = await import('dts-bundle-generator');
      const packageJson = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf8'));
      const dependencies = Object.keys(packageJson.dependencies);

      const dts = await generateDtsBundle(
        [
          {
            filePath: resolve(process.cwd(), 'src/bundle.ts'),
            libraries: {
              inlinedLibraries: dependencies
            }
          }
        ],
        {
          preferredConfigPath: resolve(process.cwd(), './tsconfig.lib.json')
        }
      );
      await writeFileSync(resolve(process.cwd(), 'dist/bundles/index.d.ts'), dts.join('\n'));
    }
  };
}
