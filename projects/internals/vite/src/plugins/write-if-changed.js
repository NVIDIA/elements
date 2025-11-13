import { extname } from 'path';

const cache = {};

/**
 * Vite plugin that only writes bundle files to disk if their content has changed.
 * This optimization prevents unnecessary file system writes and downstream rebuilds
 * when content remains identical.
 *
 * @param {Object} options - Plugin options
 * @param {string} options.outDir - Output directory path
 * @returns {Object} Vite plugin object
 */
export function writeIfChanged(options = {}) {
  return {
    name: 'write-if-changed',
    generateBundle(_options, bundles) {
      for (const [key, bundleFile] of Object.entries(bundles)) {
        const path = `${options.outDir}/${bundleFile.fileName}`;

        if (extname(path) === '.js' && cache[path] !== bundleFile.code) {
          cache[path] = bundleFile.code;
        } else {
          delete bundles[key];
        }
      }
    }
  };
}
