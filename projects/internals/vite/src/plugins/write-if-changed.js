import { extname, resolve } from 'path';
import { writeFileSync, mkdirSync } from 'fs';

const cache = {};

/**
 * Vite plugin that only writes bundle files to disk if their content has changed.
 * This optimization prevents unnecessary file system writes and downstream rebuilds
 * when content remains identical.
 *
 * Uses writeBundle instead of generateBundle for Rolldown compatibility
 * (Rolldown does not support mutating the bundle object).
 *
 * @param {Object} options - Plugin options
 * @param {string} options.outDir - Output directory path
 * @returns {Object} Vite plugin object
 */
export function writeIfChanged(options = {}) {
  return {
    name: 'write-if-changed',
    writeBundle(outputOptions, bundle) {
      const dir = outputOptions.dir || options.outDir;
      for (const [, bundleFile] of Object.entries(bundle)) {
        if (extname(bundleFile.fileName) !== '.js' || bundleFile.type !== 'chunk') {
          continue;
        }

        const filePath = resolve(dir, bundleFile.fileName);

        if (cache[filePath] === bundleFile.code) {
          continue;
        }

        cache[filePath] = bundleFile.code;
        mkdirSync(resolve(dir, bundleFile.fileName, '..'), { recursive: true });
        writeFileSync(filePath, bundleFile.code);
      }
    }
  };
}
