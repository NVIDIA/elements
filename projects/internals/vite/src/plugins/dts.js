import { resolve } from 'path';
import dtsPlugin from 'vite-plugin-dts';

/**
 * Generates type definition files for published package
 */
export function dts() {
  return dtsPlugin({
    copyDtsFiles: true,
    tsconfigPath: resolve(process.cwd(), './tsconfig.lib.json')
  });
}
