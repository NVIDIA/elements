import { resolve } from 'path';
import dtsPlugin from 'vite-plugin-dts';

const cache = {};

/**
 * Generates type definition files for published package
 */
export function dts() {
  return dtsPlugin({
    copyDtsFiles: true,
    tsconfigPath: resolve(process.cwd(), './tsconfig.lib.json'),
    beforeWriteFile: (filePath, content) => {
      if (cache[filePath] !== content) {
        cache[filePath] = content;
      } else {
        return false;
      }
    }
  });
}
